import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { getStreakAndXp } from "@/lib/gamification";

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
    const rows = await sql`SELECT id FROM learner.users WHERE clerk_id = ${clerkId}`;
    if (rows.length === 0) {
      return NextResponse.json({ currentStreak: 0, longestStreak: 0, totalXp: 0, badges: [] });
    }

    const data = await getStreakAndXp(sql, rows[0].id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/gamification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
