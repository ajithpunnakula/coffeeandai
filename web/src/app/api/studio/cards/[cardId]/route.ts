import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const user = await requireAuthor();
    const { cardId } = await params;
    const body = await request.json();

    const sql = getDb();

    // Optimistic concurrency: check updated_at if provided
    if (body.expectedUpdatedAt) {
      const existing = await sql`
        SELECT updated_at FROM content.card_drafts WHERE id = ${cardId}
      `;
      if (existing.length === 0) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      if (
        new Date(existing[0].updated_at).getTime() !==
        new Date(body.expectedUpdatedAt).getTime()
      ) {
        return NextResponse.json(
          { error: "Conflict: card was modified by another session" },
          { status: 409 },
        );
      }
    }

    const rows = await sql`
      UPDATE content.card_drafts SET
        title = COALESCE(${body.title ?? null}, title),
        body_md = COALESCE(${body.body_md ?? null}, body_md),
        card_type = COALESCE(${body.card_type ?? null}, card_type),
        difficulty = COALESCE(${body.difficulty ?? null}, difficulty),
        domain = COALESCE(${body.domain ?? null}, domain),
        metadata = COALESCE(${body.metadata ?? null}, metadata),
        image_url = COALESCE(${body.image_url ?? null}, image_url),
        audio_url = COALESCE(${body.audio_url ?? null}, audio_url),
        updated_at = now()
      WHERE id = ${cardId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Log edit
    await sql`
      INSERT INTO content.edit_history (course_slug, card_id, user_id, action, after_snapshot)
      VALUES (${rows[0].course_slug}, ${cardId}, ${user.id}, 'manual_edit', ${JSON.stringify(body)})
    `;

    return NextResponse.json(rows[0]);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/studio/cards/[cardId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const user = await requireAuthor();
    const { cardId } = await params;

    const sql = getDb();

    // Get card info for audit before deleting
    const existing = await sql`
      SELECT * FROM content.card_drafts WHERE id = ${cardId}
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const card = existing[0];

    // Remove from card_order
    await sql`
      UPDATE content.course_drafts
      SET card_order = array_remove(card_order, ${cardId}), updated_at = now()
      WHERE slug = ${card.course_slug}
    `;

    // Delete the card
    await sql`DELETE FROM content.card_drafts WHERE id = ${cardId}`;

    // Log deletion
    await sql`
      INSERT INTO content.edit_history (course_slug, card_id, user_id, action, before_snapshot)
      VALUES (${card.course_slug}, ${cardId}, ${user.id}, 'delete_card', ${JSON.stringify(card)})
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/studio/cards/[cardId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
