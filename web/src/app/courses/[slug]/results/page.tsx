import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import Leaderboard from "@/components/Leaderboard";

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
    SELECT title FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  if (!rows[0]) return {};
  return { title: `Results — ${rows[0].title}` };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const sql = getDb();

  const courseRows = await sql`
    SELECT id, title, pass_threshold FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  const course = courseRows[0];
  if (!course) return notFound();

  const completionRows = await sql`
    SELECT comp.* FROM learner.completions comp
    JOIN learner.users u ON u.id = comp.user_id
    WHERE u.clerk_id = ${userId} AND comp.course_slug = ${slug}
    ORDER BY comp.completed_at DESC
    LIMIT 1
  `;
  const completion = completionRows[0];

  if (!completion) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">No Results Yet</h1>
          <p className="text-gray-400 mb-6">
            You haven&apos;t completed this course yet.
          </p>
          <Link
            href={`/courses/${slug}`}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Back to Course
          </Link>
        </div>
      </main>
    );
  }

  const passed = completion.score >= course.pass_threshold;
  const domainScores: Record<string, number> = completion.domain_scores ?? {};

  // Compute percentile
  const percentileRows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE score < ${completion.score}) * 100.0 / NULLIF(COUNT(*), 0) AS percentile,
      COUNT(*) AS total_completions
    FROM learner.completions
    WHERE course_slug = ${slug}
  `;
  const percentile = percentileRows[0]?.percentile != null ? Math.round(Number(percentileRows[0].percentile)) : null;
  const totalCompletions = Number(percentileRows[0]?.total_completions ?? 0);

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-100 mb-2">{course.title}</h1>
      <h2 className="text-lg mb-8 text-gray-500">Results</h2>

      <div
        className={`rounded-2xl p-8 text-center mb-8 border ${
          passed
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-red-500/5 border-red-500/20"
        }`}
      >
        <p className="text-5xl font-bold text-gray-100 mb-2">
          {Math.round(completion.score)}%
        </p>
        <p
          className={`text-lg font-semibold ${
            passed ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {passed ? "PASSED" : "NOT PASSED"}
        </p>
        {percentile != null && totalCompletions > 1 && (
          <p className="text-sm text-gray-400 mt-2">
            You scored better than <span className="text-amber-400 font-semibold">{percentile}%</span> of learners
          </p>
        )}
      </div>

      {Object.keys(domainScores).length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Domain Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(domainScores).map(([domain, score]) => (
              <div key={domain}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{domain}</span>
                  <span className="font-medium text-gray-200">{Math.round(score)}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= course.pass_threshold
                        ? "bg-emerald-500"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {passed && completion.certificate_hash && (
        <section className="mb-8 p-4 bg-gray-800/30 border border-gray-800 rounded-xl">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Certificate Hash
          </h3>
          <p className="font-mono text-sm text-gray-400 break-all">
            {completion.certificate_hash}
          </p>
        </section>
      )}

      {/* Course Leaderboard */}
      <section className="mb-8">
        <Leaderboard scope="course" slug={slug} />
      </section>

      <Link
        href="/browse"
        className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/10"
      >
        Back to Courses
      </Link>
    </main>
  );
}
