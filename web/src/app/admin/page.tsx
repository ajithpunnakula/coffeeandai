import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Please sign in.</p>
      </main>
    );
  }

  const sql = getDb();

  const userRows = await sql`
    SELECT role FROM learner.users WHERE clerk_id = ${userId} LIMIT 1
  `;
  const user = userRows[0];

  if (!user || user.role !== "admin") {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">403 Forbidden</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Admin access required.</p>
      </main>
    );
  }

  const courses = await sql`
    SELECT
      c.id, c.slug, c.title,
      count(DISTINCT e.user_id) AS enrollment_count,
      round(avg(comp.score), 1) AS avg_score,
      round(
        100.0 * count(DISTINCT comp.id) / NULLIF(count(DISTINCT e.user_id), 0), 1
      ) AS avg_completion_rate
    FROM content.courses c
    LEFT JOIN learner.enrollments e ON e.course_slug = c.slug
    LEFT JOIN learner.completions comp ON comp.course_slug = c.slug
    GROUP BY c.id
    ORDER BY c.published_at DESC
  `;

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <th className="py-3 pr-4">Course</th>
              <th className="py-3 pr-4">Enrollments</th>
              <th className="py-3 pr-4">Completion Rate</th>
              <th className="py-3 pr-4">Avg Score</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="py-3 pr-4 font-medium">{c.title}</td>
                <td className="py-3 pr-4">{c.enrollment_count}</td>
                <td className="py-3 pr-4">
                  {c.avg_completion_rate ?? "0"}%
                </td>
                <td className="py-3 pr-4">
                  {c.avg_score ?? "N/A"}
                </td>
                <td className="py-3">
                  <Link
                    href={`/admin/courses/${c.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
