import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await requireAuthor();
    const { courseSlug, cardOrder } = await request.json();

    if (!courseSlug || !Array.isArray(cardOrder)) {
      return NextResponse.json(
        { error: "courseSlug and cardOrder array are required" },
        { status: 400 },
      );
    }

    const sql = getDb();

    // Update ord on each card
    for (let i = 0; i < cardOrder.length; i++) {
      await sql`
        UPDATE content.card_drafts SET ord = ${i} WHERE id = ${cardOrder[i]}
      `;
    }

    // Update card_order on the course draft
    await sql`
      UPDATE content.course_drafts
      SET card_order = ${cardOrder}, updated_at = now()
      WHERE slug = ${courseSlug}
    `;

    // Log reorder
    await sql`
      INSERT INTO content.edit_history (course_slug, user_id, action, after_snapshot)
      VALUES (${courseSlug}, ${user.id}, 'reorder', ${JSON.stringify({ cardOrder })})
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/studio/cards/reorder error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
