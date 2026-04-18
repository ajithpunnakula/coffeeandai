import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
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
        <p className="text-gray-600 mt-2">Admin access required.</p>
      </main>
    );
  }

  const courseRows = await sql`
    SELECT id, title FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  const course = courseRows[0];
  if (!course) return notFound();

  const metrics = await sql`
    SELECT
      c.id, c.title, c.card_type,
      m.pass_rate, m.avg_attempts, m.skip_rate, m.flagged
    FROM content.cards c
    LEFT JOIN content.card_metrics m ON m.card_id = c.id
    WHERE c.course_slug = ${slug}
    ORDER BY c.ord ASC
  `;

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <Link href="/admin" className="text-blue-600 hover:underline text-sm">
        &larr; Admin Dashboard
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-8">{course.title}</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-3 pr-4">Card</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Pass Rate</th>
              <th className="py-3 pr-4">Avg Attempts</th>
              <th className="py-3 pr-4">Skip Rate</th>
              <th className="py-3 pr-4">Flagged</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr
                key={m.id}
                className={`border-b ${
                  m.flagged ? "bg-red-50 text-red-900" : "hover:bg-gray-50"
                }`}
              >
                <td className="py-3 pr-4 font-medium">{m.title}</td>
                <td className="py-3 pr-4">{m.card_type}</td>
                <td className="py-3 pr-4">
                  {m.pass_rate != null ? `${Math.round(m.pass_rate)}%` : "N/A"}
                </td>
                <td className="py-3 pr-4">
                  {m.avg_attempts != null
                    ? Number(m.avg_attempts).toFixed(1)
                    : "N/A"}
                </td>
                <td className="py-3 pr-4">
                  {m.skip_rate != null ? `${Math.round(m.skip_rate)}%` : "N/A"}
                </td>
                <td className="py-3 pr-4">
                  {m.flagged ? (
                    <span className="text-red-600 font-semibold">Yes</span>
                  ) : (
                    "No"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
