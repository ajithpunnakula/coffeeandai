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

  // Parse domains from JSONB column
  const domains: { name: string; weight: number }[] =
    (typeof course.domains === "string" ? JSON.parse(course.domains) : course.domains) ?? [];

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
  const examTarget: string = course.exam_target ?? "";

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        &larr; All Courses
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-2">{course.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{summary}</p>

      {examTarget && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Target Exam</h2>
          <p className="text-gray-700 dark:text-gray-300">{examTarget}</p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Exam Format</h2>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{course.estimated_minutes} minutes</span>
          <span>Pass threshold: {Math.round(Number(course.pass_threshold) * 100)}%</span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Domain Breakdown</h2>
        <div className="space-y-2">
          {domains.map((d, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {d.weight}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {enrollment ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Progress: {progress?.completed ?? 0} / {progress?.total ?? 0} cards
            completed
          </p>
          <Link
            href={`/courses/${slug}/play`}
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Continue Learning
          </Link>
        </div>
      ) : (
        <form action={`/api/enroll`} method="POST">
          <input type="hidden" name="courseSlug" value={slug} />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Start Course
          </button>
        </form>
      )}
    </main>
  );
}
