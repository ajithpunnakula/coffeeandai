import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { generateCardId } from "@/lib/draft-db";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await requireAuthor();
    const body = await request.json();

    const { courseSlug, cardType, title, ord } = body;
    if (!courseSlug || !cardType || !title) {
      return NextResponse.json(
        { error: "courseSlug, cardType, and title are required" },
        { status: 400 },
      );
    }

    const id = generateCardId();
    const sql = getDb();

    const rows = await sql`
      INSERT INTO content.card_drafts (id, course_slug, card_type, ord, title, metadata)
      VALUES (${id}, ${courseSlug}, ${cardType}, ${ord ?? 0}, ${title}, ${getDefaultMetadata(cardType)})
      RETURNING *
    `;

    // Add to card_order
    await sql`
      UPDATE content.course_drafts
      SET card_order = array_append(card_order, ${id}), updated_at = now()
      WHERE slug = ${courseSlug}
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/studio/cards error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function getDefaultMetadata(cardType: string): string {
  switch (cardType) {
    case "quiz":
      return JSON.stringify({
        questions: [
          {
            prompt: "Question text",
            choices: [
              { text: "Option A", correct: true },
              { text: "Option B", correct: false },
              { text: "Option C", correct: false },
              { text: "Option D", correct: false },
            ],
          },
        ],
        pass_threshold: 0.7,
      });
    case "scenario":
      return JSON.stringify({
        steps: [
          {
            id: "start",
            situation: "Describe the scenario",
            choices: [
              { text: "Choice A", next: "end", score: 1 },
              { text: "Choice B", next: "end", score: 0 },
            ],
          },
          {
            id: "end",
            situation: "Outcome",
            outcome: "Result of the scenario",
          },
        ],
      });
    case "reflection":
      return JSON.stringify({ prompt: "What did you learn?" });
    default:
      return "{}";
  }
}
