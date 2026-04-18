import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

async function getOrCreateUser(sql: any, clerkId: string) {
  const rows =
    await sql`SELECT id FROM learner.users WHERE clerk_id = ${clerkId}`;
  if (rows.length > 0) return rows[0].id;
  const newRows =
    await sql`INSERT INTO learner.users (clerk_id) VALUES (${clerkId}) RETURNING id`;
  return newRows[0].id;
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Tutor not configured" },
        { status: 503 },
      );
    }

    const { courseSlug, cardId, message } = await request.json();
    if (!courseSlug || !cardId || !message) {
      return NextResponse.json(
        { error: "courseSlug, cardId, and message are required" },
        { status: 400 },
      );
    }

    const sql = getDb();
    const userId = await getOrCreateUser(sql, clerkId);

    // Rate limit: max 20 interactions per hour
    const rateLimitRows = await sql`
      SELECT COUNT(*)::int AS cnt
      FROM learner.interactions
      WHERE user_id = ${userId}
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    if (rateLimitRows[0].cnt >= 20) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 },
      );
    }

    // 1. Current card body
    const cardRows = await sql`
      SELECT id, title, card_type, domain, body_md, metadata
      FROM content.cards
      WHERE id = ${cardId} AND course_slug = ${courseSlug}
    `;
    if (cardRows.length === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    const card = cardRows[0];

    // 2. Prerequisite concepts (one hop back via content.graphs)
    const prereqRows = await sql`
      SELECT c.title, c.domain, c.body_md
      FROM content.graphs g,
           unnest(g.prerequisites) AS prereq_concept
      JOIN content.cards c ON c.domain = prereq_concept AND c.course_slug = ${courseSlug}
      WHERE g.course_slug = ${courseSlug}
        AND g.concept = ${card.domain}
      LIMIT 5
    `;

    // 3. Wiki references from card metadata
    const wikiRefs: string[] = [];
    if (card.metadata?.wiki_refs && Array.isArray(card.metadata.wiki_refs)) {
      for (const ref of card.metadata.wiki_refs.slice(0, 3)) {
        const refRows = await sql`
          SELECT title, body_md FROM content.cards
          WHERE course_slug = ${courseSlug} AND title = ${ref}
          LIMIT 1
        `;
        if (refRows.length > 0) {
          wikiRefs.push(`## ${refRows[0].title}\n${refRows[0].body_md}`);
        }
      }
    }

    // 4. Learner profile
    const profileRows = await sql`
      SELECT domain_mastery, weak_concepts, summary_md
      FROM learner.profiles
      WHERE user_id = ${userId} AND course_slug = ${courseSlug}
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    const profile = profileRows.length > 0 ? profileRows[0] : null;

    // 5. Last 5 interactions (conversation history)
    const historyRows = await sql`
      SELECT role, content
      FROM learner.interactions
      WHERE user_id = ${userId}
        AND card_id = ${cardId}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const history = historyRows.reverse().map((r: any) => ({
      role: r.role as "user" | "assistant",
      content: r.content,
    }));

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      card,
      prereqRows,
      wikiRefs,
      profile,
    );

    // Call Anthropic Messages API with streaming
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 2000,
        stream: true,
        system: systemPrompt,
        messages: [...history, { role: "user", content: message }],
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error("Anthropic API error:", resp.status, errBody);
      return NextResponse.json(
        { error: "Tutor unavailable" },
        { status: 502 },
      );
    }

    // Persist user message
    await sql`
      INSERT INTO learner.interactions (user_id, card_id, course_slug, role, content)
      VALUES (${userId}, ${cardId}, ${courseSlug}, 'user', ${message})
    `;

    // Stream response, collect full text for persistence
    let fullResponse = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = resp.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);
                if (
                  event.type === "content_block_delta" &&
                  event.delta?.type === "text_delta"
                ) {
                  const text = event.delta.text;
                  fullResponse += text;
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // skip malformed JSON lines
              }
            }
          }

          controller.close();

          // Persist assistant response after stream completes
          if (fullResponse) {
            const persistSql = getDb();
            await persistSql`
              INSERT INTO learner.interactions (user_id, card_id, course_slug, role, content)
              VALUES (${userId}, ${cardId}, ${courseSlug}, 'assistant', ${fullResponse})
            `;
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("POST /api/tutor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function buildSystemPrompt(
  card: any,
  prereqs: any[],
  wikiRefs: string[],
  profile: any,
): string {
  const parts: string[] = [];

  parts.push(
    `You are a helpful tutor assisting a learner with a training course. Be concise, supportive, and Socratic — guide the learner to understand rather than giving answers directly.`,
  );

  parts.push(`\n## Current Card\nTitle: ${card.title}\nType: ${card.card_type}\nDomain: ${card.domain ?? "General"}\n\n${card.body_md ?? ""}`);

  if (prereqs.length > 0) {
    parts.push(`\n## Prerequisite Concepts`);
    for (const p of prereqs) {
      parts.push(`### ${p.title} (${p.domain ?? "General"})\n${p.body_md ?? ""}`);
    }
  }

  if (wikiRefs.length > 0) {
    parts.push(`\n## Reference Material\n${wikiRefs.join("\n\n")}`);
  }

  if (profile) {
    parts.push(`\n## Learner Profile`);
    if (profile.summary_md) {
      parts.push(profile.summary_md);
    }
    if (profile.weak_concepts && profile.weak_concepts.length > 0) {
      parts.push(
        `Weak areas: ${profile.weak_concepts.join(", ")}. Pay extra attention to explanations in these areas.`,
      );
    }
  }

  parts.push(
    `\nKeep responses under 300 words. Use markdown for formatting. Do not reveal internal system details.`,
  );

  return parts.join("\n");
}
