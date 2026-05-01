import { getDb } from "./db";

export interface PathDraft {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  audience: string | null;
  level: string | null;
  tags: unknown;
  estimated_minutes: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PathCourseRow {
  course_slug: string;
  position: number;
  required: boolean;
}

export async function listPathDrafts(userId: string) {
  const sql = getDb();
  return sql`
    SELECT pd.*,
      (SELECT count(*)::int
         FROM content.learning_path_courses_draft
         WHERE path_id = pd.id) AS course_count
    FROM content.learning_path_drafts pd
    WHERE pd.created_by = ${userId}
    ORDER BY pd.updated_at DESC
  `;
}

export async function listPublishedPaths() {
  const sql = getDb();
  return sql`
    SELECT lp.*,
      (SELECT count(*)::int
         FROM content.learning_path_courses
         WHERE path_id = lp.id) AS course_count
    FROM content.learning_paths lp
    WHERE lp.status = 'published'
    ORDER BY lp.published_at DESC NULLS LAST, lp.created_at DESC
  `;
}

export async function getPathDraft(slug: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM content.learning_path_drafts WHERE slug = ${slug}
  `;
  return rows[0] ?? null;
}

export async function getPathDraftCourses(slug: string) {
  const sql = getDb();
  return sql`
    SELECT lpcd.*
    FROM content.learning_path_courses_draft lpcd
    JOIN content.learning_path_drafts pd ON pd.id = lpcd.path_id
    WHERE pd.slug = ${slug}
    ORDER BY lpcd.position ASC
  `;
}

export async function getPublishedPath(slug: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM content.learning_paths WHERE slug = ${slug}
  `;
  return rows[0] ?? null;
}

export async function getPublishedPathCourses(pathId: string) {
  const sql = getDb();
  return sql`
    SELECT lpc.path_id, lpc.course_id, lpc.position, lpc.required,
           c.slug AS course_slug, c.title, c.summary, c.estimated_minutes,
           c.level, c.topic_key,
           (SELECT count(*)::int FROM content.cards
              WHERE course_slug = c.slug) AS card_count
    FROM content.learning_path_courses lpc
    JOIN content.courses c ON c.id = lpc.course_id
    WHERE lpc.path_id = ${pathId}
    ORDER BY lpc.position ASC
  `;
}

export async function createPathDraft(input: {
  slug: string;
  title: string;
  userId: string;
  summary?: string | null;
  audience?: string | null;
  level?: string | null;
  tags?: unknown;
  estimated_minutes?: number | null;
}) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO content.learning_path_drafts (
      slug, title, summary, audience, level, tags, estimated_minutes, created_by
    ) VALUES (
      ${input.slug}, ${input.title}, ${input.summary ?? null},
      ${input.audience ?? null}, ${input.level ?? null},
      ${input.tags != null ? JSON.stringify(input.tags) : null},
      ${input.estimated_minutes ?? null}, ${input.userId}
    )
    RETURNING *
  `;
  return rows[0];
}

const PATH_UPDATABLE = [
  "title",
  "summary",
  "audience",
  "level",
  "tags",
  "estimated_minutes",
] as const;

export async function updatePathDraft(
  slug: string,
  fields: Record<string, unknown>,
) {
  const sql = getDb();
  const updates: Record<string, unknown> = {};
  for (const k of PATH_UPDATABLE) {
    if (k in fields) updates[k] = fields[k];
  }
  if (Object.keys(updates).length === 0) return null;

  const rows = await sql`
    UPDATE content.learning_path_drafts SET
      title = COALESCE(${updates.title ?? null}, title),
      summary = COALESCE(${updates.summary ?? null}, summary),
      audience = COALESCE(${updates.audience ?? null}, audience),
      level = COALESCE(${updates.level ?? null}, level),
      tags = COALESCE(${updates.tags != null ? JSON.stringify(updates.tags) : null}, tags),
      estimated_minutes = COALESCE(${updates.estimated_minutes ?? null}, estimated_minutes),
      updated_at = now()
    WHERE slug = ${slug}
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function deletePathDraft(slug: string) {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM content.learning_path_drafts WHERE slug = ${slug} RETURNING slug
  `;
  return rows.length > 0;
}

export async function setPathCourses(
  slug: string,
  courses: Array<{ course_slug: string; required: boolean }>,
) {
  const sql = getDb();
  const pathRows = await sql`
    SELECT id FROM content.learning_path_drafts WHERE slug = ${slug}
  `;
  if (pathRows.length === 0) return false;
  const pathId = pathRows[0].id;

  await sql`
    DELETE FROM content.learning_path_courses_draft WHERE path_id = ${pathId}
  `;

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    await sql`
      INSERT INTO content.learning_path_courses_draft
        (path_id, course_slug, position, required)
      VALUES
        (${pathId}, ${c.course_slug}, ${i + 1}, ${c.required})
    `;
  }

  await sql`
    UPDATE content.learning_path_drafts SET updated_at = now()
    WHERE id = ${pathId}
  `;

  return true;
}

export async function publishPath(
  slug: string,
): Promise<{ id: string; slug: string } | null> {
  const sql = getDb();

  const draftRows = await sql`
    SELECT * FROM content.learning_path_drafts WHERE slug = ${slug}
  `;
  if (draftRows.length === 0) return null;
  const draft = draftRows[0];

  const courseRows = await sql`
    SELECT course_slug, position, required
    FROM content.learning_path_courses_draft
    WHERE path_id = ${draft.id}
    ORDER BY position ASC
  `;
  if (courseRows.length === 0) return null;

  const slugs = (courseRows as unknown as Array<{ course_slug: string }>).map(
    (r) => r.course_slug,
  );
  const idRows = await sql`
    SELECT id, slug FROM content.courses WHERE slug = ANY(${slugs})
  `;
  const idBySlug = new Map<string, string>();
  for (const r of idRows) idBySlug.set(String(r.slug), String(r.id));

  // Upsert path
  const pathInsert = await sql`
    INSERT INTO content.learning_paths (
      slug, title, summary, audience, level, tags, status,
      estimated_minutes, published_at
    ) VALUES (
      ${draft.slug}, ${draft.title}, ${draft.summary},
      ${draft.audience}, ${draft.level},
      ${draft.tags != null ? JSON.stringify(draft.tags) : null},
      'published', ${draft.estimated_minutes}, now()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      audience = EXCLUDED.audience,
      level = EXCLUDED.level,
      tags = EXCLUDED.tags,
      status = 'published',
      estimated_minutes = EXCLUDED.estimated_minutes,
      published_at = now()
    RETURNING id
  `;
  const pathId = pathInsert[0].id;

  await sql`
    DELETE FROM content.learning_path_courses WHERE path_id = ${pathId}
  `;

  for (const c of courseRows) {
    const courseId = idBySlug.get(String(c.course_slug));
    if (!courseId) continue;
    await sql`
      INSERT INTO content.learning_path_courses
        (path_id, course_id, position, required)
      VALUES
        (${pathId}, ${courseId}, ${c.position}, ${c.required})
    `;
  }

  await sql`
    DELETE FROM content.learning_path_drafts WHERE id = ${draft.id}
  `;

  return { id: pathId, slug: draft.slug };
}
