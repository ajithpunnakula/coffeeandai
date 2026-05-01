import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  isPathComplete,
  type CourseProgressMap,
  type PathCourse,
} from "@/lib/path-gating";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Certificate · ${slug}`,
    description: "Path completion certificate.",
  };
}

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = sp.preview === "1";

  const sql = getDb();
  const pathRows = await sql`
    SELECT * FROM content.learning_paths WHERE slug = ${slug} AND status = 'published'
  `;
  if (pathRows.length === 0) notFound();
  const path = pathRows[0];

  const courseRows = await sql`
    SELECT lpc.path_id, lpc.course_id, lpc.position, lpc.required,
           c.slug AS course_slug, c.title
    FROM content.learning_path_courses lpc
    JOIN content.courses c ON c.id = lpc.course_id
    WHERE lpc.path_id = ${path.id}
    ORDER BY lpc.position ASC
  `;

  type CourseRow = {
    course_id: string | number;
    course_slug: string;
    position: number;
    required: boolean | null;
    title: string;
  };

  const pathCourses: PathCourse[] = (courseRows as CourseRow[]).map((r) => ({
    course_id: String(r.course_id),
    course_slug: String(r.course_slug),
    position: Number(r.position),
    required: r.required !== false,
  }));

  const { userId: clerkId } = await auth();

  let displayName = "Preview Learner";
  let issuedAt = new Date();
  let isComplete = false;

  if (clerkId) {
    const userRows = await sql`
      SELECT id, display_name FROM learner.users WHERE clerk_id = ${clerkId} LIMIT 1
    `;
    const user = userRows[0];
    if (user) {
      displayName = user.display_name || "Learner";
      const slugs = pathCourses.map((c) => c.course_slug);
      const progress: CourseProgressMap = {};
      if (slugs.length > 0) {
        const rows = await sql`
          SELECT c.course_slug,
                 count(*)::int AS total,
                 count(*) FILTER (WHERE cp.status = 'completed')::int AS completed
          FROM content.cards c
          LEFT JOIN learner.card_progress cp ON cp.card_id = c.id
            AND cp.user_id = ${user.id}
          WHERE c.course_slug = ANY(${slugs})
          GROUP BY c.course_slug
        `;
        for (const r of rows) {
          const total = Number(r.total ?? 0);
          const completed = Number(r.completed ?? 0);
          progress[String(r.course_slug)] = {
            complete: total > 0 && completed >= total,
          };
        }
      }
      isComplete = isPathComplete(pathCourses, progress);
      const enr = await sql`
        SELECT completed_at FROM learner.path_enrollments
        WHERE user_id = ${user.id} AND path_id = ${path.id}
        LIMIT 1
      `;
      if (enr[0]?.completed_at) {
        issuedAt = new Date(String(enr[0].completed_at));
      }
    }
  }

  // Eligibility gate. Preview mode bypasses for live verification + sharing
  // template review; otherwise the learner must be signed in and complete.
  if (!isPreview && !isComplete) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-100 mb-3">
          Not yet, almost there
        </h1>
        <p className="text-gray-400 mb-6">
          {clerkId
            ? `Finish all required courses in “${path.title}” to unlock your certificate.`
            : "Sign in to view your certificate."}
        </p>
        <Link
          href={`/paths/${path.slug}`}
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
        >
          Back to path
        </Link>
      </main>
    );
  }

  const courseTitles = (courseRows as CourseRow[]).map((r) => r.title);
  const issuedDate = issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/paths/${path.slug}`}
        className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block"
      >
        ← Back to path
      </Link>

      <article
        data-cert={isPreview ? "preview" : "issued"}
        data-path-slug={path.slug}
        className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-10 sm:p-14 shadow-2xl text-center"
      >
        <div className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-6">
          coffeeandai
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-3">
          Certificate of Completion
        </h1>
        <p className="text-gray-400 mb-10">This certifies that</p>
        <div className="text-2xl sm:text-3xl font-serif italic text-amber-300 mb-10">
          {displayName}
        </div>
        <p className="text-gray-300 mb-2">has completed the learning path</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-8">
          {path.title}
        </h2>

        {courseTitles.length > 0 && (
          <ul className="text-sm text-gray-400 space-y-1 mb-10 max-w-md mx-auto">
            {courseTitles.map((t, i) => (
              <li key={i}>· {t}</li>
            ))}
          </ul>
        )}

        <div className="text-xs text-gray-500 tracking-wider">
          Issued {issuedDate}
          {isPreview && (
            <span className="ml-2 text-amber-400">(preview)</span>
          )}
        </div>
      </article>
    </main>
  );
}
