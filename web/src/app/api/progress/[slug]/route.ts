import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const sql = getDb();

    const rows = await sql`
      SELECT
        cp.card_id,
        cp.status,
        cp.score,
        cp.completed_at
      FROM learner.card_progress cp
      JOIN content.cards c ON c.id = cp.card_id
      JOIN learner.users u ON u.id = cp.user_id
      WHERE c.course_slug = ${slug}
        AND u.clerk_id = ${clerkId}
      ORDER BY c.ord ASC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/progress/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
