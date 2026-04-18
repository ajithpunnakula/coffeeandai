import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

async function getOrCreateUser(sql: any, clerkId: string) {
  const rows =
    await sql`SELECT id FROM learner.users WHERE clerk_id = ${clerkId}`;
  if (rows.length > 0) return rows[0].id;
  const newRows =
    await sql`INSERT INTO learner.users (clerk_id) VALUES (${clerkId}) RETURNING id`;
  return newRows[0].id;
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId, eventType, payload } = await request.json();
    if (!cardId || !eventType) {
      return NextResponse.json(
        { error: "cardId and eventType are required" },
        { status: 400 },
      );
    }

    const sql = getDb();
    const userId = await getOrCreateUser(sql, clerkId);

    await sql`
      INSERT INTO learner.card_events (user_id, card_id, event_type, payload)
      VALUES (${userId}, ${cardId}, ${eventType}, ${JSON.stringify(payload ?? {})})
    `;

    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
