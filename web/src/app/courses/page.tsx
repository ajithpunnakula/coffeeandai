import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function CoursesPage() {
  const { userId } = await auth();
  const sql = getDb();

  const courses = await sql`
    SELECT c.id, c.slug, c.title, c.target_audience, c.estimated_minutes,
           c.pass_threshold,
           jsonb_array_length(COALESCE(c.domains, '[]'::jsonb)) AS domain_count
    FROM content.courses c
    WHERE c.status = 'published'
    ORDER BY c.published_at DESC
  `;

  let enrolledCourseIds = new Set<string>();
  if (userId) {
    const enrollments = await sql`
      SELECT course_slug FROM learner.enrollments e
      JOIN learner.users u ON u.id = e.user_id
      WHERE u.clerk_id = ${userId}
    `;
    enrolledCourseIds = new Set(enrollments.map((e) => String(e.course_slug)));
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const enrolled = enrolledCourseIds.has(String(course.slug));
          return (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col justify-between bg-white dark:bg-gray-900 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {course.target_audience}
                </p>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{course.estimated_minutes} min</span>
                  <span>{course.domain_count} domains</span>
                  <span>Pass: {Math.round(Number(course.pass_threshold) * 100)}%</span>
                </div>
              </div>
              <Link
                href={`/courses/${course.slug}`}
                className={`block text-center py-2 rounded-lg font-medium ${
                  enrolled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {enrolled ? "Continue" : "Enroll"}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
