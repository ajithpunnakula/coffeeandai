import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse interactive, card-based courses to prepare for AI certifications.",
  openGraph: {
    type: "website",
    title: "Courses",
    description:
      "Browse interactive, card-based courses to prepare for AI certifications.",
    url: "https://coffeeandai.xyz/courses",
  },
};

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

const DOMAIN_ICONS: Record<string, string> = {
  "Agentic Architecture": "🏗️",
  "Tool Design": "🔧",
  "Claude Code": "💻",
  "Prompt Engineering": "✍️",
  "Context Management": "📋",
};

function getDomainIcon(name: string): string {
  for (const [key, icon] of Object.entries(DOMAIN_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "📚";
}

export default async function CoursesPage() {
  const { userId } = await auth();
  const sql = getDb();

  const courses = await sql`
    SELECT c.id, c.slug, c.title, c.summary, c.target_audience, c.estimated_minutes,
           c.pass_threshold, c.domains,
           jsonb_array_length(COALESCE(c.domains, '[]'::jsonb)) AS domain_count,
           (SELECT count(*)::int FROM content.cards WHERE course_slug = c.slug) AS card_count
    FROM content.courses c
    WHERE c.status = 'published'
    ORDER BY c.published_at DESC
  `;

  // Social proof: enrollment counts and pass rates per course
  const socialRows = await sql`
    SELECT
      e.course_slug,
      COUNT(DISTINCT e.user_id)::int AS enrolled_count,
      COUNT(DISTINCT c.id) FILTER (WHERE c.passed = true)::int AS pass_count,
      COUNT(DISTINCT c.id)::int AS completion_count
    FROM learner.enrollments e
    LEFT JOIN learner.completions c ON c.course_slug = e.course_slug AND c.user_id = e.user_id
    GROUP BY e.course_slug
  `;
  const socialMap: Record<string, { enrolled: number; passRate: number | null }> = {};
  for (const row of socialRows) {
    socialMap[row.course_slug] = {
      enrolled: Number(row.enrolled_count),
      passRate: Number(row.completion_count) > 0
        ? Math.round((Number(row.pass_count) / Number(row.completion_count)) * 100)
        : null,
    };
  }

  let enrolledSlugs = new Set<string>();
  let progressMap: Record<string, { completed: number; total: number }> = {};
  if (userId) {
    const enrollments = await sql`
      SELECT e.course_slug FROM learner.enrollments e
      JOIN learner.users u ON u.id = e.user_id
      WHERE u.clerk_id = ${userId}
    `;
    enrolledSlugs = new Set(enrollments.map((e) => String(e.course_slug)));

    if (enrolledSlugs.size > 0) {
      const slugs = Array.from(enrolledSlugs);
      const progressRows = await sql`
        SELECT c.course_slug,
               count(*) FILTER (WHERE cp.status = 'completed') AS completed,
               count(*) AS total
        FROM content.cards c
        LEFT JOIN learner.card_progress cp ON cp.card_id = c.id
          AND cp.user_id = (SELECT id FROM learner.users WHERE clerk_id = ${userId})
        WHERE c.course_slug = ANY(${slugs})
        GROUP BY c.course_slug
      `;
      for (const row of progressRows) {
        progressMap[row.course_slug] = {
          completed: Number(row.completed),
          total: Number(row.total),
        };
      }
    }
  }

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-gray-950 to-gray-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Master AI
            </span>
            <br />
            <span className="text-gray-100">one card at a time</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mb-8">
            Interactive, bite-sized courses to prepare you for AI certifications.
            Learn by doing with quizzes, scenarios, and an AI tutor by your side.
          </p>
          <div className="flex gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-3 py-1.5">
              🎯 Exam-aligned
            </span>
            <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-3 py-1.5">
              🤖 AI tutor
            </span>
            <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-3 py-1.5">
              📱 Learn anywhere
            </span>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Available Courses
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const enrolled = enrolledSlugs.has(String(course.slug));
            const progress = progressMap[String(course.slug)];
            const domains: { name: string; weight: number }[] =
              (typeof course.domains === "string"
                ? JSON.parse(course.domains)
                : course.domains) ?? [];
            const progressPct =
              progress && progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;
            const social = socialMap[String(course.slug)];

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />

                <div className="p-6 flex flex-col flex-1">
                  {/* Domain pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {domains.slice(0, 3).map((d, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5"
                      >
                        {getDomainIcon(d.name)} {d.name.split("&")[0].trim()}
                      </span>
                    ))}
                    {domains.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{domains.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-amber-400 transition-colors mb-2">
                    {course.title}
                  </h3>

                  {/* Summary */}
                  {course.summary && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {course.summary}
                    </p>
                  )}

                  <div className="mt-auto">
                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
                      <span>{course.card_count} cards</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span>{course.estimated_minutes} min</span>
                      {social && social.enrolled > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span>{social.enrolled} enrolled</span>
                        </>
                      )}
                      {social && social.passRate != null && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className="text-emerald-400">{social.passRate}% pass rate</span>
                        </>
                      )}
                    </div>

                    {/* Progress or CTA */}
                    {enrolled && progress ? (
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-400">
                            {progress.completed} / {progress.total} completed
                          </span>
                          <span className="text-amber-400 font-medium">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm font-medium text-amber-400 group-hover:text-amber-300">
                        Start learning
                        <svg
                          className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
