import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { requireDeveloper, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await requireDeveloper();
    const { courseSlug, cardId, message, currentCardData } =
      await request.json();

    if (!courseSlug || !message) {
      return new Response(
        JSON.stringify({ error: "courseSlug and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const sql = getDb();

    // Get course context
    const courseRows = await sql`
      SELECT title, summary, domains, exam_target
      FROM content.course_drafts WHERE slug = ${courseSlug}
    `;
    const course = courseRows[0];

    // Get neighboring cards for context
    const neighborCards = await sql`
      SELECT title, card_type, domain FROM content.card_drafts
      WHERE course_slug = ${courseSlug}
      ORDER BY ord
      LIMIT 10
    `;

    const systemPrompt = buildAIAssistPrompt(
      course,
      currentCardData,
      neighborCards,
    );

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      maxTokens: 2000,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("POST /api/developer/ai-assist error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

function buildAIAssistPrompt(
  course: any,
  currentCard: any,
  neighbors: any[],
): string {
  const parts: string[] = [];

  parts.push(
    `You are a course design expert helping a developer refine educational content. Be concise and actionable.`,
  );

  if (course) {
    parts.push(
      `\n## Course Context\nTitle: ${course.title}\nSummary: ${course.summary ?? "N/A"}\nExam Target: ${course.exam_target ?? "N/A"}`,
    );
  }

  if (currentCard) {
    parts.push(`\n## Current Card\nType: ${currentCard.card_type}\nTitle: ${currentCard.title}`);
    if (currentCard.body_md) {
      parts.push(`Content:\n${currentCard.body_md}`);
    }
    if (currentCard.metadata) {
      const meta =
        typeof currentCard.metadata === "string"
          ? currentCard.metadata
          : JSON.stringify(currentCard.metadata, null, 2);
      parts.push(`Metadata:\n${meta}`);
    }
  }

  if (neighbors.length > 0) {
    parts.push(`\n## Other Cards in Course`);
    for (const n of neighbors) {
      parts.push(`- [${n.card_type}] ${n.title} (${n.domain ?? "General"})`);
    }
  }

  parts.push(
    `\nWhen suggesting edits, format them clearly so the developer can copy them. Use markdown. Keep responses under 500 words.`,
  );

  return parts.join("\n");
}
