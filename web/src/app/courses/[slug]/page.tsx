import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();
  const sql = getDb();

  const rows = await sql`
    SELECT * FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  const course = rows[0];
  if (!course) return notFound();

  const domains: { name: string; weight: number }[] =
    (typeof course.domains === "string" ? JSON.parse(course.domains) : course.domains) ?? [];

  const cardCountRows = await sql`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE card_type = 'quiz') AS quizzes,
           count(*) FILTER (WHERE card_type = 'scenario') AS scenarios,
           count(*) FILTER (WHERE card_type = 'page') AS pages
    FROM content.cards WHERE course_slug = ${slug}
  `;
  const cardCounts = cardCountRows[0];

  let enrollment = null;
  let progress = null;
  if (userId) {
    const enrollRows = await sql`
      SELECT e.user_id FROM learner.enrollments e
      JOIN learner.users u ON u.id = e.user_id
      WHERE u.clerk_id = ${userId} AND e.course_slug = ${slug}
      LIMIT 1
    `;
    enrollment = enrollRows[0] ?? null;

    if (enrollment) {
      const progressRows = await sql`
        SELECT count(*) FILTER (WHERE cp.status = 'completed') AS completed,
               count(*) AS total
        FROM content.cards c
        LEFT JOIN learner.card_progress cp ON cp.card_id = c.id AND cp.user_id = ${enrollment.user_id}
        WHERE c.course_slug = ${slug}
      `;
      progress = progressRows[0];
    }
  }

  const summary: string = course.summary ?? "";
  const progressPct =
    progress && Number(progress.total) > 0
      ? Math.round((Number(progress.completed) / Number(progress.total)) * 100)
      : 0;

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Courses
          </Link>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mb-3">
            {course.title}
          </h1>
          {summary && (
            <p className="text-lg text-gray-400 max-w-2xl">{summary}</p>
          )}

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-amber-400 text-lg">📝</span>
              <div>
                <div className="text-xs text-gray-500">Cards</div>
                <div className="text-sm font-semibold text-gray-200">{cardCounts.total}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-amber-400 text-lg">⏱️</span>
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-semibold text-gray-200">{course.estimated_minutes} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-amber-400 text-lg">🎯</span>
              <div>
                <div className="text-xs text-gray-500">Pass threshold</div>
                <div className="text-sm font-semibold text-gray-200">{Math.round(Number(course.pass_threshold) * 100)}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-amber-400 text-lg">🧩</span>
              <div>
                <div className="text-xs text-gray-500">Quizzes</div>
                <div className="text-sm font-semibold text-gray-200">{cardCounts.quizzes}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <section>
              <h2 className="text-lg font-bold text-gray-100 mb-4">What you&apos;ll learn</h2>
              <div className="space-y-3">
                {domains.map((d, i) => (
                  <div key={i} className="rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-200">{d.name}</span>
                      <span className="text-xs font-mono bg-amber-500/10 text-amber-400 rounded-full px-2 py-0.5">
                        {Math.round(d.weight * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500/60 to-orange-500/60 rounded-full"
                        style={{ width: `${d.weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Course format */}
            <section>
              <h2 className="text-lg font-bold text-gray-100 mb-4">Course format</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-800/30 p-4 text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-xl font-bold text-gray-200">{cardCounts.pages}</div>
                  <div className="text-xs text-gray-500">Lesson cards</div>
                </div>
                <div className="rounded-lg bg-gray-800/30 p-4 text-center">
                  <div className="text-2xl mb-1">❓</div>
                  <div className="text-xl font-bold text-gray-200">{cardCounts.quizzes}</div>
                  <div className="text-xs text-gray-500">Quizzes</div>
                </div>
                <div className="rounded-lg bg-gray-800/30 p-4 text-center">
                  <div className="text-2xl mb-1">🎭</div>
                  <div className="text-xl font-bold text-gray-200">{cardCounts.scenarios}</div>
                  <div className="text-xs text-gray-500">Scenarios</div>
                </div>
                <div className="rounded-lg bg-gray-800/30 p-4 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xl font-bold text-gray-200">AI</div>
                  <div className="text-xs text-gray-500">Tutor included</div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
              {enrollment ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-amber-400 font-semibold">{progressPct}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {progress?.completed ?? 0} of {progress?.total ?? 0} cards completed
                    </p>
                  </div>
                  <Link
                    href={`/courses/${slug}/play`}
                    className="block w-full text-center py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Continue Learning
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    Ready to start? Enroll now and learn at your own pace.
                  </p>
                  <form action="/api/enroll" method="POST">
                    <input type="hidden" name="courseSlug" value={slug} />
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
                    >
                      Start Course
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
