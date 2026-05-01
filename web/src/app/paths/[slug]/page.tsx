import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  computePathGating,
  isPathComplete,
  type CourseProgressMap,
  type PathCourse,
} from "@/lib/path-gating";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Path · ${slug}`,
    description: "A learning path on coffeeandai.",
  };
}

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

function levelLabel(l: string | null) {
  if (!l) return null;
  return l.charAt(0).toUpperCase() + l.slice(1);
}

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sql = getDb();
  const { userId: clerkId } = await auth();

  const pathRows = await sql`
    SELECT * FROM content.learning_paths WHERE slug = ${slug} AND status = 'published'
  `;
  if (pathRows.length === 0) {
    notFound();
  }
  const path = pathRows[0];

  const courseRows = await sql`
    SELECT lpc.path_id, lpc.course_id, lpc.position, lpc.required,
           c.slug AS course_slug, c.title, c.summary, c.estimated_minutes,
           c.level, c.topic_key,
           (SELECT count(*)::int FROM content.cards
              WHERE course_slug = c.slug) AS card_count
    FROM content.learning_path_courses lpc
    JOIN content.courses c ON c.id = lpc.course_id
    WHERE lpc.path_id = ${path.id}
    ORDER BY lpc.position ASC
  `;

  type CourseRow = {
    course_id: string | number;
    course_slug: string;
    position: number;
    required: boolean | null;
    title: string;
    summary: string | null;
    estimated_minutes: number | null;
    level: string | null;
    card_count: number | string;
  };

  const pathCourses: PathCourse[] = (courseRows as CourseRow[]).map((r) => ({
    course_id: String(r.course_id),
    course_slug: String(r.course_slug),
    position: Number(r.position),
    required: r.required !== false,
  }));

  // Per-course progress for the signed-in user.
  const progress: CourseProgressMap = {};
  let isEnrolled = false;
  if (clerkId) {
    const slugs = pathCourses.map((c) => c.course_slug);
    if (slugs.length > 0) {
      const rows = await sql`
        SELECT c.course_slug,
               count(*)::int AS total,
               count(*) FILTER (WHERE cp.status = 'completed')::int AS completed
        FROM content.cards c
        LEFT JOIN learner.card_progress cp ON cp.card_id = c.id
          AND cp.user_id = (SELECT id FROM learner.users WHERE clerk_id = ${clerkId})
        WHERE c.course_slug = ANY(${slugs})
        GROUP BY c.course_slug
      `;
      for (const r of rows) {
        const total = Number(r.total ?? 0);
        const completed = Number(r.completed ?? 0);
        progress[String(r.course_slug)] = {
          complete: total > 0 && completed >= total,
        };
      }
    }

    const enr = await sql`
      SELECT 1 FROM learner.path_enrollments
      WHERE path_id = ${path.id}
        AND user_id = (SELECT id FROM learner.users WHERE clerk_id = ${clerkId})
    `;
    isEnrolled = enr.length > 0;
  }

  const gates = computePathGating(pathCourses, progress);
  const complete = isPathComplete(pathCourses, progress);
  const requiredCount = pathCourses.filter((c) => c.required).length;
  const requiredCompleted = pathCourses.filter(
    (c) => c.required && progress[c.course_slug]?.complete,
  ).length;
  const pct =
    requiredCount > 0
      ? Math.round((requiredCompleted / requiredCount) * 100)
      : 100;

  // Map course rows by slug for rendering
  const courseBySlug: Record<string, CourseRow> = {};
  for (const r of courseRows as CourseRow[]) {
    courseBySlug[String(r.course_slug)] = r;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/browse"
        className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block"
      >
        ← Browse
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{path.title}</h1>
        {path.summary && (
          <p className="text-gray-400 mb-4">{path.summary}</p>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          {path.audience && <span>Audience: {path.audience}</span>}
          {path.level && (
            <span data-level-pill={path.level}>
              Level: {levelLabel(path.level)}
            </span>
          )}
          {path.estimated_minutes && (
            <span>Est. {path.estimated_minutes} min</span>
          )}
          <span>
            {pathCourses.length} course{pathCourses.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">
                {requiredCompleted} / {requiredCount} required complete
              </span>
              <span className="text-amber-400 font-medium">{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
                data-progress-pct={pct}
              />
            </div>
          </div>

          {!complete && !isEnrolled && (
            <form method="POST" action="/api/enroll/path">
              <input type="hidden" name="pathSlug" value={path.slug} />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
              >
                {clerkId ? "Enroll in path" : "Sign in to enroll"}
              </button>
            </form>
          )}
          {complete && (
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-sm font-medium"
                data-path-status="complete"
              >
                Complete
              </span>
              <Link
                href={`/paths/${path.slug}/certificate`}
                className="px-3 py-1.5 rounded-full bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-400"
              >
                View certificate
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="space-y-3">
        {gates.map((g, i) => {
          const c = courseBySlug[g.course_slug];
          if (!c) return null;
          return (
            <div
              key={g.course_slug}
              data-course-slug={g.course_slug}
              data-locked={g.locked ? "true" : "false"}
              data-required={g.required ? "true" : "false"}
              data-complete={g.complete ? "true" : "false"}
              className={`rounded-xl border p-5 flex items-start justify-between gap-4 transition ${
                g.locked
                  ? "border-gray-800 bg-gray-900/30 opacity-60"
                  : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold text-gray-100 line-clamp-1">
                    {c.title}
                  </h3>
                  {!g.required && (
                    <span className="text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                      Optional
                    </span>
                  )}
                  {c.level && (
                    <span
                      className="text-xs bg-gray-800 text-amber-300 rounded-full px-2 py-0.5"
                      data-level-pill={c.level}
                    >
                      {levelLabel(c.level)}
                    </span>
                  )}
                  {g.complete && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-300 rounded-full px-2 py-0.5">
                      ✓ Complete
                    </span>
                  )}
                </div>
                {c.summary && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {c.summary}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  {c.card_count} cards · {c.estimated_minutes ?? "—"} min
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                {g.locked ? (
                  <span
                    data-locked="true"
                    className="text-xs text-gray-500 inline-flex items-center gap-1"
                  >
                    🔒 Locked
                  </span>
                ) : (
                  <Link
                    href={`/courses/${c.course_slug}`}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-300 text-sm font-medium hover:bg-amber-500/20"
                  >
                    {g.complete ? "Review" : "Open"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
