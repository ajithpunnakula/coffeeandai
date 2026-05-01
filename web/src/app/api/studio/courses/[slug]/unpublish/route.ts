import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAuthor();
    const { slug } = await params;

    const sql = getDb();

    const rows = await sql`
      UPDATE content.courses
      SET status = 'draft'
      WHERE slug = ${slug}
      RETURNING slug
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/studio/courses/[slug]/unpublish error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
