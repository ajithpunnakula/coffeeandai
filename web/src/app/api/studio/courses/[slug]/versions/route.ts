import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAuthor();
    const { slug } = await params;

    const sql = getDb();

    const versions = await sql`
      SELECT cv.id, cv.version, cv.title, cv.published_at,
        u.display_name AS published_by_name,
        (SELECT count(*)::int FROM content.card_versions WHERE version_id = cv.id) AS card_count
      FROM content.course_versions cv
      LEFT JOIN learner.users u ON u.id = cv.published_by
      WHERE cv.slug = ${slug}
      ORDER BY cv.version DESC
    `;

    return NextResponse.json({ versions });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/studio/courses/[slug]/versions error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
