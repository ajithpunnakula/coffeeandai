import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

interface CardStat {
  card_id: string;
  card_title: string;
  ord: number;
  pass_rate: number | null;
  skip_rate: number | null;
  flagged: boolean | null;
}

interface CourseHeatmap {
  slug: string;
  title: string;
  cards: CardStat[];
}

interface PathFunnelStage {
  path_slug: string;
  path_title: string;
  enrolled: number;
  completed: number;
}

function heatColor(passRate: number | null): string {
  if (passRate == null) return "bg-gray-800 text-gray-500";
  if (passRate >= 80) return "bg-emerald-500/20 text-emerald-300";
  if (passRate >= 60) return "bg-amber-500/20 text-amber-300";
  if (passRate >= 40) return "bg-orange-500/20 text-orange-300";
  return "bg-red-500/20 text-red-300";
}

export default async function AdminInsightsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-gray-400 mt-2">Please sign in.</p>
      </main>
    );
  }

  const sql = getDb();
  const userRows = await sql`
    SELECT role FROM learner.users WHERE clerk_id = ${userId} LIMIT 1
  `;
  if (!userRows[0] || userRows[0].role !== "admin") {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">403 Forbidden</h1>
        <p className="text-gray-400 mt-2">Admin access required.</p>
      </main>
    );
  }

  // Course-level drop-off heatmap (per card pass/skip).
  const cardRows = await sql`
    SELECT
      c.id AS card_id, c.course_slug, c.title AS card_title, c.ord,
      co.title AS course_title,
      m.pass_rate, m.skip_rate, m.flagged
    FROM content.cards c
    JOIN content.courses co ON co.slug = c.course_slug
    LEFT JOIN content.card_metrics m ON m.card_id = c.id
    WHERE co.status = 'published'
    ORDER BY c.course_slug, c.ord ASC
  `;

  const heatmaps: CourseHeatmap[] = [];
  const heatmapBySlug = new Map<string, CourseHeatmap>();
  for (const r of cardRows as Array<{
    card_id: string;
    course_slug: string;
    course_title: string;
    card_title: string;
    ord: number;
    pass_rate: number | null;
    skip_rate: number | null;
    flagged: boolean | null;
  }>) {
    let bucket = heatmapBySlug.get(r.course_slug);
    if (!bucket) {
      bucket = { slug: r.course_slug, title: r.course_title, cards: [] };
      heatmapBySlug.set(r.course_slug, bucket);
      heatmaps.push(bucket);
    }
    bucket.cards.push({
      card_id: r.card_id,
      card_title: r.card_title,
      ord: r.ord,
      pass_rate: r.pass_rate != null ? Number(r.pass_rate) : null,
      skip_rate: r.skip_rate != null ? Number(r.skip_rate) : null,
      flagged: r.flagged ?? false,
    });
  }

  // Path funnel: enrolled vs completed per path.
  const funnelRows = await sql`
    SELECT
      lp.slug AS path_slug,
      lp.title AS path_title,
      count(*)::int AS enrolled,
      count(*) FILTER (WHERE pe.completed_at IS NOT NULL)::int AS completed
    FROM content.learning_paths lp
    LEFT JOIN learner.path_enrollments pe ON pe.path_id = lp.id
    WHERE lp.status = 'published'
    GROUP BY lp.slug, lp.title
    ORDER BY enrolled DESC NULLS LAST
  `;
  const funnel = (funnelRows as PathFunnelStage[]).map((r) => ({
    ...r,
    enrolled: Number(r.enrolled),
    completed: Number(r.completed),
  }));

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <Link href="/admin" className="text-blue-400 hover:underline text-sm">
        ← Admin
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">Insights</h1>
      <p className="text-gray-400 text-sm mb-10">
        Drop-off heatmaps per course and path funnels.
      </p>

      <section data-section="heatmap" className="mb-12">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Card drop-off heatmap
        </h2>
        {heatmaps.length === 0 ? (
          <p
            data-empty="heatmap"
            className="text-sm text-gray-500 border border-gray-800 rounded-xl p-6"
          >
            No card metrics yet. Heatmap will populate once learners attempt
            cards.
          </p>
        ) : (
          <div className="space-y-6">
            {heatmaps.map((h) => (
              <div
                key={h.slug}
                data-course-slug={h.slug}
                className="border border-gray-800 rounded-xl p-4"
              >
                <h3 className="font-medium text-gray-100 mb-3">{h.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {h.cards.map((c) => (
                    <div
                      key={c.card_id}
                      title={`${c.card_title} — pass ${c.pass_rate ?? "?"}%, skip ${c.skip_rate ?? "?"}%`}
                      className={`w-8 h-8 rounded text-xs flex items-center justify-center font-medium ${heatColor(
                        c.pass_rate,
                      )}`}
                    >
                      {c.ord}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section data-section="path-funnel">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Path funnel</h2>
        {funnel.length === 0 ? (
          <p
            data-empty="path-funnel"
            className="text-sm text-gray-500 border border-gray-800 rounded-xl p-6"
          >
            No published paths yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="py-2 pr-4">Path</th>
                  <th className="py-2 pr-4">Enrolled</th>
                  <th className="py-2 pr-4">Completed</th>
                  <th className="py-2 pr-4">Completion rate</th>
                </tr>
              </thead>
              <tbody>
                {funnel.map((f) => {
                  const pct =
                    f.enrolled > 0
                      ? Math.round((f.completed / f.enrolled) * 100)
                      : 0;
                  return (
                    <tr
                      key={f.path_slug}
                      data-path-slug={f.path_slug}
                      className="border-b border-gray-900 hover:bg-gray-900/40"
                    >
                      <td className="py-2 pr-4">{f.path_title}</td>
                      <td className="py-2 pr-4 tabular-nums">{f.enrolled}</td>
                      <td className="py-2 pr-4 tabular-nums">{f.completed}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        <span
                          className={
                            pct >= 50 ? "text-emerald-400" : "text-amber-300"
                          }
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
