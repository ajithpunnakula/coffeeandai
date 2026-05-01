import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { PRE_ASSESSMENT_QUESTIONS } from "@/lib/pre-assessment";
import { QuickCheckForm } from "./QuickCheckForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic_key: string }>;
}): Promise<Metadata> {
  const { topic_key } = await params;
  return {
    title: `Find your level · ${topic_key}`,
    description: "A 5-question quick check to recommend a starting level.",
  };
}

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function QuickCheckPage({
  params,
}: {
  params: Promise<{ topic_key: string }>;
}) {
  const { topic_key } = await params;

  const sql = getDb();
  const courseRows = await sql`
    SELECT slug, title, level
    FROM content.courses
    WHERE topic_key = ${topic_key} AND status = 'published'
    ORDER BY
      CASE level
        WHEN 'basic' THEN 0
        WHEN 'intermediate' THEN 1
        WHEN 'advanced' THEN 2
        ELSE 99
      END
  `;

  if (courseRows.length === 0) {
    notFound();
  }

  type Row = { slug: string; title: string; level: string | null };
  const slugByLevel: Record<string, string> = {};
  for (const r of courseRows as Row[]) {
    if (r.level) slugByLevel[r.level] = r.slug;
  }
  const topicTitle = ((courseRows[0] as Row).title || topic_key).replace(
    /\s*[—-]\s*(Basic|Intermediate|Advanced)$/i,
    "",
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href="/browse"
        className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block"
      >
        ← Browse
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Find your level
        </h1>
        <p className="text-gray-400">
          5 quick questions about{" "}
          <span className="text-gray-200 font-medium">{topicTitle}</span>. We&rsquo;ll
          recommend a starting course.
        </p>
      </header>

      <QuickCheckForm
        questions={PRE_ASSESSMENT_QUESTIONS}
        slugByLevel={slugByLevel}
        topicKey={topic_key}
      />
    </main>
  );
}
