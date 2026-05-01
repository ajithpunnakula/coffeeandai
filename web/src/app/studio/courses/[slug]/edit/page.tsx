import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import CourseEditor from "@/components/studio/CourseEditor";

export default async function EditCoursePage({
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

  // Load draft course
  const courseRows = await sql`
    SELECT * FROM content.course_drafts WHERE slug = ${slug}
  `;
  if (courseRows.length === 0) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Draft Not Found</h1>
        <p className="text-gray-400 mt-2">
          No draft found for &quot;{slug}&quot;.
        </p>
      </main>
    );
  }

  const course = courseRows[0];

  // Load draft cards
  const cards = await sql`
    SELECT * FROM content.card_drafts
    WHERE course_slug = ${slug}
    ORDER BY ord ASC
  `;

  // Parse metadata for each card
  const parsedCards = cards.map((c: any) => ({
    ...c,
    metadata:
      typeof c.metadata === "string" ? JSON.parse(c.metadata) : c.metadata,
  }));

  const initialCourse = {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    domains: course.domains,
    estimated_minutes: course.estimated_minutes,
    pass_threshold: course.pass_threshold,
    exam_target: course.exam_target,
    target_audience: course.target_audience,
    tags: course.tags,
    card_order: course.card_order ?? [],
    cards: parsedCards,
  };

  return <CourseEditor initialCourse={initialCourse} />;
}
