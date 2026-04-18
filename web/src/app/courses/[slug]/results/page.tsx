import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";

function getDb() {
  return neon(process.env.DATABASE_URL!);
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
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Results Yet</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You haven&apos;t completed this course yet.
        </p>
        <Link
          href={`/courses/${slug}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Course
        </Link>
      </main>
    );
  }

  const passed = completion.score >= course.pass_threshold;
  const domainScores: Record<string, number> = completion.domain_scores ?? {};

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <h2 className="text-xl mb-6 text-gray-600 dark:text-gray-400">Results</h2>

      <div
        className={`rounded-xl p-8 text-center mb-8 ${
          passed ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        }`}
      >
        <p className="text-5xl font-bold mb-2">
          {Math.round(completion.score)}%
        </p>
        <p
          className={`text-lg font-semibold ${
            passed ? "text-green-700" : "text-red-700"
          }`}
        >
          {passed ? "PASSED" : "NOT PASSED"}
        </p>
      </div>

      {Object.keys(domainScores).length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Domain Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(domainScores).map(([domain, score]) => (
              <div key={domain}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{domain}</span>
                  <span className="font-medium">{Math.round(score)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= course.pass_threshold
                        ? "bg-green-500"
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
        <section className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Certificate Hash
          </h3>
          <p className="font-mono text-sm break-all">
            {completion.certificate_hash}
          </p>
        </section>
      )}

      <Link
        href="/courses"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
      >
        Back to Courses
      </Link>
    </main>
  );
}
