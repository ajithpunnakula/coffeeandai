import { getDb } from "./db";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateCardId(): string {
  const hex = Math.random().toString(16).substring(2, 10);
  return `card_${hex}`;
}

export async function listDrafts(userId: string) {
  const sql = getDb();
  return sql`
    SELECT cd.*,
      (SELECT count(*)::int FROM content.card_drafts WHERE course_slug = cd.slug) AS card_count
    FROM content.course_drafts cd
    WHERE cd.created_by = ${userId}
    ORDER BY cd.updated_at DESC
  `;
}

export async function listPublished() {
  const sql = getDb();
  return sql`
    SELECT c.*,
      (SELECT count(*)::int FROM content.cards WHERE course_slug = c.slug) AS card_count
    FROM content.courses c
    WHERE c.status = 'published'
    ORDER BY c.published_at DESC
  `;
}

export async function getDraft(slug: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM content.course_drafts WHERE slug = ${slug}
  `;
  return rows[0] ?? null;
}

export async function getDraftCards(slug: string) {
  const sql = getDb();
  return sql`
    SELECT * FROM content.card_drafts
    WHERE course_slug = ${slug}
    ORDER BY ord ASC
  `;
}

export async function createEmptyDraft(
  title: string,
  slug: string,
  userId: string,
) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO content.course_drafts (slug, title, created_by, card_order)
    VALUES (${slug}, ${title}, ${userId}, '{}')
    RETURNING *
  `;
  return rows[0];
}

export async function clonePublishedToDraft(
  courseSlug: string,
  userId: string,
) {
  const sql = getDb();

  // Get published course
  const courseRows = await sql`
    SELECT * FROM content.courses WHERE slug = ${courseSlug}
  `;
  if (courseRows.length === 0) return null;
  const course = courseRows[0];

  // Create draft from published
  const draftRows = await sql`
    INSERT INTO content.course_drafts (
      slug, title, summary, exam_target, target_audience,
      estimated_minutes, pass_threshold, domains, wiki_refs,
      card_order, tags, created_by
    ) VALUES (
      ${course.slug}, ${course.title}, ${course.summary},
      ${course.exam_target}, ${course.target_audience},
      ${course.estimated_minutes}, ${course.pass_threshold},
      ${course.domains}, ${course.wiki_refs},
      ${course.card_order}, ${course.tags}, ${userId}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      exam_target = EXCLUDED.exam_target,
      target_audience = EXCLUDED.target_audience,
      estimated_minutes = EXCLUDED.estimated_minutes,
      pass_threshold = EXCLUDED.pass_threshold,
      domains = EXCLUDED.domains,
      wiki_refs = EXCLUDED.wiki_refs,
      card_order = EXCLUDED.card_order,
      tags = EXCLUDED.tags,
      updated_at = now()
    RETURNING *
  `;

  // Copy cards — preserve original card IDs for stability
  const cards = await sql`
    SELECT * FROM content.cards WHERE course_slug = ${courseSlug} ORDER BY ord
  `;
  for (const card of cards) {
    await sql`
      INSERT INTO content.card_drafts (
        id, course_slug, card_type, ord, difficulty, title,
        body_md, domain, metadata, wiki_refs, image_url, audio_url, source
      ) VALUES (
        ${card.id}, ${courseSlug}, ${card.card_type}, ${card.ord},
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
        source = EXCLUDED.source,
        updated_at = now()
    `;
  }

  return draftRows[0];
}

export async function updateDraft(
  slug: string,
  fields: Record<string, any>,
) {
  const sql = getDb();
  // Build dynamic update — only allowed fields
  const allowed = [
    "title",
    "summary",
    "exam_target",
    "target_audience",
    "estimated_minutes",
    "pass_threshold",
    "domains",
    "wiki_refs",
    "card_order",
    "tags",
  ];

  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (key in fields) updates[key] = fields[key];
  }

  if (Object.keys(updates).length === 0) return null;

  // Use individual field updates
  const rows = await sql`
    UPDATE content.course_drafts SET
      title = COALESCE(${updates.title ?? null}, title),
      summary = COALESCE(${updates.summary ?? null}, summary),
      exam_target = COALESCE(${updates.exam_target ?? null}, exam_target),
      target_audience = COALESCE(${updates.target_audience ?? null}, target_audience),
      estimated_minutes = COALESCE(${updates.estimated_minutes ?? null}, estimated_minutes),
      pass_threshold = COALESCE(${updates.pass_threshold ?? null}, pass_threshold),
      domains = COALESCE(${updates.domains ?? null}, domains),
      wiki_refs = COALESCE(${updates.wiki_refs ?? null}, wiki_refs),
      card_order = COALESCE(${updates.card_order ?? null}, card_order),
      tags = COALESCE(${updates.tags ?? null}, tags),
      updated_at = now()
    WHERE slug = ${slug}
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function deleteDraft(slug: string) {
  const sql = getDb();
  // card_drafts cascade-deleted via FK
  const rows = await sql`
    DELETE FROM content.course_drafts WHERE slug = ${slug} RETURNING slug
  `;
  return rows.length > 0;
}
