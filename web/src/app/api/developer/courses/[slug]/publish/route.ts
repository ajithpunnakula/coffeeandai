import { NextResponse } from "next/server";
import { requireDeveloper, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireDeveloper();
    const { slug } = await params;

    const sql = getDb();

    // 1. Get draft
    const draftRows = await sql`
      SELECT * FROM content.course_drafts WHERE slug = ${slug}
    `;
    if (draftRows.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    const draft = draftRows[0];

    // 2. Get draft cards
    const draftCards = await sql`
      SELECT * FROM content.card_drafts WHERE course_slug = ${slug} ORDER BY ord
    `;

    if (draftCards.length === 0) {
      return NextResponse.json(
        { error: "Cannot publish a course with no cards" },
        { status: 400 },
      );
    }

    // 3. Determine version number
    const versionRows = await sql`
      SELECT COALESCE(MAX(version), 0)::int AS max_version
      FROM content.course_versions WHERE slug = ${slug}
    `;
    const nextVersion = (versionRows[0].max_version ?? 0) + 1;

    // 4. Check if course already exists in published table
    const existingCourse = await sql`
      SELECT id FROM content.courses WHERE slug = ${slug}
    `;
    const courseId = existingCourse.length > 0
      ? existingCourse[0].id
      : slug; // Use slug as ID for new courses

    // 5. Create version snapshot
    const versionInsert = await sql`
      INSERT INTO content.course_versions (
        course_id, slug, version, title, summary, exam_target,
        target_audience, estimated_minutes, pass_threshold,
        domains, wiki_refs, card_order, tags, published_by
      ) VALUES (
        ${courseId}, ${slug}, ${nextVersion}, ${draft.title},
        ${draft.summary}, ${draft.exam_target}, ${draft.target_audience},
        ${draft.estimated_minutes}, ${draft.pass_threshold},
        ${draft.domains}, ${draft.wiki_refs}, ${draft.card_order},
        ${draft.tags}, ${user.id}
      )
      RETURNING id
    `;
    const versionId = versionInsert[0].id;

    // 6. Snapshot cards into card_versions
    for (const card of draftCards) {
      await sql`
        INSERT INTO content.card_versions (
          version_id, card_id, card_type, ord, difficulty, title,
          body_md, domain, metadata, wiki_refs, image_url, audio_url, source
        ) VALUES (
          ${versionId}, ${card.id}, ${card.card_type}, ${card.ord},
          ${card.difficulty}, ${card.title}, ${card.body_md}, ${card.domain},
          ${card.metadata}, ${card.wiki_refs}, ${card.image_url},
          ${card.audio_url}, ${card.source}
        )
      `;
    }

    // 7. Upsert into content.courses
    await sql`
      INSERT INTO content.courses (
        id, slug, title, summary, status, exam_target, target_audience,
        estimated_minutes, pass_threshold, domains, wiki_refs,
        card_order, tags, published_version_id, published_at
      ) VALUES (
        ${courseId}, ${slug}, ${draft.title}, ${draft.summary},
        'published', ${draft.exam_target}, ${draft.target_audience},
        ${draft.estimated_minutes}, ${draft.pass_threshold},
        ${draft.domains}, ${draft.wiki_refs}, ${draft.card_order},
        ${draft.tags}, ${versionId}, now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        status = 'published',
        exam_target = EXCLUDED.exam_target,
        target_audience = EXCLUDED.target_audience,
        estimated_minutes = EXCLUDED.estimated_minutes,
        pass_threshold = EXCLUDED.pass_threshold,
        domains = EXCLUDED.domains,
        wiki_refs = EXCLUDED.wiki_refs,
        card_order = EXCLUDED.card_order,
        tags = EXCLUDED.tags,
        published_version_id = EXCLUDED.published_version_id,
        published_at = now()
    `;

    // 8. Upsert cards into content.cards (preserve IDs for learner progress)
    for (const card of draftCards) {
      await sql`
        INSERT INTO content.cards (
          id, course_slug, card_type, ord, difficulty, title,
          body_md, domain, metadata, wiki_refs, image_url, audio_url, source
        ) VALUES (
          ${card.id}, ${slug}, ${card.card_type}, ${card.ord},
          ${card.difficulty}, ${card.title}, ${card.body_md}, ${card.domain},
          ${card.metadata}, ${card.wiki_refs}, ${card.image_url},
          ${card.audio_url}, ${card.source}
        )
        ON CONFLICT (id) DO UPDATE SET
          card_type = EXCLUDED.card_type,
          ord = EXCLUDED.ord,
          difficulty = EXCLUDED.difficulty,
          title = EXCLUDED.title,
          body_md = EXCLUDED.body_md,
          domain = EXCLUDED.domain,
          metadata = EXCLUDED.metadata,
          wiki_refs = EXCLUDED.wiki_refs,
          image_url = EXCLUDED.image_url,
          audio_url = EXCLUDED.audio_url,
          source = EXCLUDED.source
      `;
    }

    // 9. Handle deleted cards: remove from card_order but keep rows
    //    if learner.card_progress references exist
    if (existingCourse.length > 0) {
      const draftCardIds = draftCards.map((c: any) => c.id);
      const existingCards = await sql`
        SELECT id FROM content.cards
        WHERE course_slug = ${slug}
          AND id != ALL(${draftCardIds})
      `;

      for (const oldCard of existingCards) {
        // Check if any tables reference this card via FK
        const hasRefs = await sql`
          SELECT 1 FROM (
            SELECT card_id FROM learner.card_progress WHERE card_id = ${oldCard.id}
            UNION ALL
            SELECT card_id FROM learner.card_events WHERE card_id = ${oldCard.id}
            UNION ALL
            SELECT card_id FROM content.card_metrics WHERE card_id = ${oldCard.id}
            UNION ALL
            SELECT card_id FROM content.card_quality WHERE card_id = ${oldCard.id}
          ) refs
          LIMIT 1
        `;

        if (hasRefs.length === 0) {
          // Safe to delete — no references exist
          await sql`DELETE FROM content.cards WHERE id = ${oldCard.id}`;
        }
        // If references exist, card row stays but is no longer in card_order
      }
    }

    // 10. Clean up draft
    await sql`DELETE FROM content.course_drafts WHERE slug = ${slug}`;

    return NextResponse.json({
      ok: true,
      version: nextVersion,
      versionId,
      slug,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/developer/courses/[slug]/publish error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
