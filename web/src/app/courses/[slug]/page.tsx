import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sql = getDb();
  const rows = await sql`
    SELECT title, summary FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  const course = rows[0];
  if (!course) return {};

  const description = course.summary || "Interactive, card-based AI certification course";
  return {
    title: course.title,
    description,
    openGraph: {
      type: "website",
      title: course.title,
      description,
      url: `https://coffeeandai.xyz/courses/${slug}`,
    },
    twitter: {
      card: "summary",
      title: course.title,
      description,
    },
  };
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
  let hasProfile = false;
  if (userId) {
    const enrollRows = await sql`
      SELECT e.user_id FROM learner.enrollments e
      JOIN learner.users u ON u.id = e.user_id
      WHERE u.clerk_id = ${userId} AND e.course_slug = ${slug}
      LIMIT 1
    `;
    enrollment = enrollRows[0] ?? null;

    if (enrollment) {
      const [progressRows, profileRows] = await Promise.all([
        sql`
          SELECT count(*) FILTER (WHERE cp.status = 'completed') AS completed,
                 count(*) AS total
          FROM content.cards c
          LEFT JOIN learner.card_progress cp ON cp.card_id = c.id AND cp.user_id = ${enrollment.user_id}
          WHERE c.course_slug = ${slug}
        `,
        sql`
          SELECT 1 FROM learner.profiles
          WHERE user_id = ${enrollment.user_id} AND course_slug = ${slug}
            AND weak_concepts IS NOT NULL AND array_length(weak_concepts, 1) > 0
          LIMIT 1
        `,
      ]);
      progress = progressRows[0];
      hasProfile = profileRows.length > 0;
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="flex items-center gap-2.5 bg-gray-800/50 rounded-lg px-4 py-3">
              <span className="text-amber-400 text-lg">📝</span>
              <div>
                <div className="text-xs text-gray-500 leading-relaxed">Cards</div>
                <div className="text-sm font-semibold text-gray-200">{cardCounts.total}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-800/50 rounded-lg px-4 py-3">
              <span className="text-amber-400 text-lg">⏱️</span>
              <div>
                <div className="text-xs text-gray-500 leading-relaxed">Duration</div>
                <div className="text-sm font-semibold text-gray-200">{course.estimated_minutes} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-800/50 rounded-lg px-4 py-3">
              <span className="text-amber-400 text-lg">🎯</span>
              <div>
                <div className="text-xs text-gray-500 leading-relaxed">Pass</div>
                <div className="text-sm font-semibold text-gray-200">{Math.round(Number(course.pass_threshold) * 100)}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-800/50 rounded-lg px-4 py-3">
              <span className="text-amber-400 text-lg">🧩</span>
              <div>
                <div className="text-xs text-gray-500 leading-relaxed">Quizzes</div>
                <div className="text-sm font-semibold text-gray-200">{cardCounts.quizzes}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* CTA - shown first on mobile, hidden on desktop (appears in sidebar instead) */}
        <div className="lg:hidden mb-8">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
            {enrollment ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
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
                    <p className="text-xs text-gray-500 mt-1.5">
                      {progress?.completed ?? 0} of {progress?.total ?? 0} cards completed
                    </p>
                  </div>
                  <Link
                    href={`/courses/${slug}/play`}
                    className="shrink-0 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Continue Learning
                  </Link>
                </div>
                <div className="flex gap-2">
                  {hasProfile && (
                    <Link
                      href={`/courses/${slug}/practice`}
                      className="flex-1 text-center py-2.5 rounded-xl font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-all text-sm"
                    >
                      Practice Weak Areas
                    </Link>
                  )}
                  {progressPct > 0 && (
                    <Link
                      href={`/courses/${slug}/dashboard`}
                      className="flex-1 text-center py-2.5 rounded-xl font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-all text-sm"
                    >
                      View Dashboard
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <p className="flex-1 text-sm text-gray-400">
                  Ready to start? Enroll now and learn at your own pace.
                </p>
                <form action="/api/enroll" method="POST">
                  <input type="hidden" name="courseSlug" value={slug} />
                  <button
                    type="submit"
                    className="shrink-0 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Start Course
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <section>
              <h2 className="text-lg font-bold text-gray-100 mb-4">What you&apos;ll learn</h2>
              <div className="space-y-2">
                {domains.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 flex-1">{d.name}</span>
                    <span className="text-xs font-mono text-gray-500">
                      {Math.round(d.weight * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course format */}
            <section>
              <h2 className="text-lg font-bold text-gray-100 mb-4">Course format</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>📄</span>
                  <span><span className="text-gray-200 font-semibold">{cardCounts.pages}</span> Lesson cards</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>❓</span>
                  <span><span className="text-gray-200 font-semibold">{cardCounts.quizzes}</span> Quizzes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>🎭</span>
                  <span><span className="text-gray-200 font-semibold">{cardCounts.scenarios}</span> Scenarios</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>🤖</span>
                  <span>AI Tutor included</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - CTA (desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
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
                  {hasProfile && (
                    <Link
                      href={`/courses/${slug}/practice`}
                      className="block w-full text-center py-3 mt-3 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-all text-sm"
                    >
                      Practice Weak Areas
                    </Link>
                  )}
                  {progressPct > 0 && (
                    <Link
                      href={`/courses/${slug}/dashboard`}
                      className="block w-full text-center py-2.5 mt-2 text-sm text-gray-500 hover:text-amber-400 transition-colors"
                    >
                      View Dashboard
                    </Link>
                  )}
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
