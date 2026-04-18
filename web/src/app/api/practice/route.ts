import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Practice mode not configured" },
        { status: 503 },
      );
    }

    const { courseSlug, concepts } = await request.json();
    if (!courseSlug) {
      return NextResponse.json(
        { error: "courseSlug is required" },
        { status: 400 },
      );
    }

    const sql = getDb();

    // Get weak concepts from learner profile if not provided
    let targetConcepts = concepts;
    if (!targetConcepts || targetConcepts.length === 0) {
      const userRows = await sql`
        SELECT id FROM learner.users WHERE clerk_id = ${clerkId} LIMIT 1
      `;
      if (userRows[0]) {
        const profileRows = await sql`
          SELECT weak_concepts FROM learner.profiles
          WHERE user_id = ${userRows[0].id} AND course_slug = ${courseSlug}
          LIMIT 1
        `;
        targetConcepts = profileRows[0]?.weak_concepts ?? [];
      }
    }

    if (!targetConcepts || targetConcepts.length === 0) {
      return NextResponse.json(
        { error: "No weak concepts found. Complete more cards first." },
        { status: 400 },
      );
    }

    // Fetch wiki content for these concepts via card wiki_refs
    const wikiCards = await sql`
      SELECT DISTINCT unnest(wiki_refs) AS wiki_ref
      FROM content.cards
      WHERE course_slug = ${courseSlug}
    `;
    const allWikiRefs = wikiCards.map((r: any) => r.wiki_ref);

    // Match concepts to wiki refs (fuzzy match)
    const relevantRefs = allWikiRefs.filter((ref: string) =>
      targetConcepts.some(
        (c: string) =>
          ref.toLowerCase().includes(c.toLowerCase()) ||
          c.toLowerCase().includes(ref.toLowerCase()),
      ),
    );

    const conceptList = targetConcepts.slice(0, 3).join(", ");

    const prompt = `Generate 3 multiple-choice practice questions about these concepts: ${conceptList}

Each question should:
- Test understanding, not just recall
- Have 4 choices, exactly 1 correct
- Include a "misconception" field on each wrong choice explaining what the learner confused
- Be at difficulty level 2 (application-level, not just definitions)

${relevantRefs.length > 0 ? `Related topics for context: ${relevantRefs.join(", ")}` : ""}

Respond with ONLY valid JSON (no markdown fencing):
{
  "questions": [
    {
      "prompt": "Question text",
      "objective": "What this tests",
      "choices": [
        { "text": "Answer A", "correct": true },
        { "text": "Answer B", "correct": false, "misconception": "specific confusion" },
        { "text": "Answer C", "correct": false, "misconception": "specific confusion" },
        { "text": "Answer D", "correct": false, "misconception": "specific confusion" }
      ]
    }
  ]
}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error("OpenAI practice error:", errBody);
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 502 },
      );
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = content.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      questions: parsed.questions,
      concepts: targetConcepts.slice(0, 3),
      pass_threshold: 0.7,
    });
  } catch (error) {
    console.error("POST /api/practice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
