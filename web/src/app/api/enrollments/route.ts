import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getDb();

    const rows = await sql`
      SELECT
        e.course_slug,
        c.title,
        e.started_at,
        e.completed_at
      FROM learner.enrollments e
      JOIN content.courses c ON c.slug = e.course_slug
      JOIN learner.users u ON u.id = e.user_id
      WHERE u.clerk_id = ${clerkId}
      ORDER BY e.started_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/enrollments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
