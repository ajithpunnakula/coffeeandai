import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import PathBuilder from "@/components/studio/PathBuilder";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function EditPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const sql = getDb();
  const pathRows = await sql`
    SELECT pd.*
    FROM content.learning_path_drafts pd
    WHERE pd.slug = ${slug}
  `;
  if (pathRows.length === 0) notFound();
  const path = pathRows[0];

  const courseRows = await sql`
    SELECT lpcd.path_id, lpcd.course_slug, lpcd.position, lpcd.required,
           c.title, c.summary, c.estimated_minutes, c.level
    FROM content.learning_path_courses_draft lpcd
    LEFT JOIN content.courses c ON c.slug = lpcd.course_slug
    WHERE lpcd.path_id = ${path.id}
    ORDER BY lpcd.position ASC
  `;

  // Library: all published courses available to add.
  const library = await sql`
    SELECT id, slug, title, summary, estimated_minutes, level, topic_key
    FROM content.courses
    WHERE status = 'published'
    ORDER BY topic_key NULLS LAST, level NULLS LAST, title ASC
  `;

  return (
    <PathBuilder
      slug={slug}
      initialPath={{
        title: path.title,
        summary: path.summary,
        audience: path.audience,
        level: path.level,
        estimated_minutes: path.estimated_minutes,
      }}
      initialCourses={(courseRows as Array<{
        course_slug: string;
        title: string | null;
        summary: string | null;
        estimated_minutes: number | null;
        level: string | null;
        position: number;
        required: boolean | null;
      }>).map((r) => ({
        slug: String(r.course_slug),
        course_slug: String(r.course_slug),
        title: r.title ?? r.course_slug,
        summary: r.summary ?? null,
        estimated_minutes: r.estimated_minutes ?? null,
        level: r.level ?? null,
        position: Number(r.position),
        required: r.required !== false,
      }))}
      library={(library as Array<{
        slug: string;
        title: string;
        summary: string | null;
        estimated_minutes: number | null;
        level: string | null;
      }>).map((c) => ({
        slug: String(c.slug),
        title: String(c.title),
        summary: c.summary ?? null,
        estimated_minutes: c.estimated_minutes ?? null,
        level: c.level ?? null,
      }))}
    />
  );
}
