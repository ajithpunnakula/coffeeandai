import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { recordCardCompletion, recordCourseCompletion } from "@/lib/gamification";

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

    const { cardId, status, score, response } = await request.json();
    if (!cardId || !status) {
      return NextResponse.json(
        { error: "cardId and status are required" },
        { status: 400 },
      );
    }

    const sql = getDb();
    const userId = await getOrCreateUser(sql, clerkId);

    // Upsert card progress
    await sql`
      INSERT INTO learner.card_progress (user_id, card_id, status, score, response)
      VALUES (${userId}, ${cardId}, ${status}, ${score ?? null}, ${response ?? null})
      ON CONFLICT (user_id, card_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        response = EXCLUDED.response,
        completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN NOW() ELSE learner.card_progress.completed_at END
    `;

    // Record gamification on card completion
    let gamification = null;
    if (status === "completed") {
      // Look up card type
      const cardRows = await sql`SELECT card_type, course_slug FROM content.cards WHERE id = ${cardId}`;
      if (cardRows.length > 0) {
        gamification = await recordCardCompletion(sql, userId, cardId, cardRows[0].card_type, score ?? null);
      }
    }

    // Check if course is complete
    const courseRows = await sql`
      SELECT c.course_slug
      FROM content.cards c
      WHERE c.id = ${cardId}
    `;

    if (courseRows.length === 0) {
      return NextResponse.json({ completed: false, gamification });
    }

    const courseSlug = courseRows[0].course_slug;

    const progressStats = await sql`
      SELECT
        COUNT(DISTINCT c.id) AS total_cards,
        COUNT(DISTINCT cp.card_id) FILTER (WHERE cp.status = 'completed') AS completed_cards,
        AVG(cp.score) FILTER (WHERE cp.score IS NOT NULL) AS avg_score
      FROM content.cards c
      LEFT JOIN learner.card_progress cp ON cp.card_id = c.id AND cp.user_id = ${userId}
      WHERE c.course_slug = ${courseSlug}
    `;

    const { total_cards, completed_cards, avg_score } = progressStats[0];
    const threshold = 0.7;
    const isComplete =
      Number(completed_cards) >= Number(total_cards) &&
      Number(total_cards) > 0 &&
      (avg_score === null || Number(avg_score) >= threshold);

    if (isComplete) {
      // Compute domain scores
      const domainScores = await sql`
        SELECT
          c.domain,
          AVG(cp.score) AS domain_score
        FROM content.cards c
        JOIN learner.card_progress cp ON cp.card_id = c.id AND cp.user_id = ${userId}
        WHERE c.course_slug = ${courseSlug} AND cp.score IS NOT NULL
        GROUP BY c.domain
      `;

      const scores: Record<string, number> = {};
      for (const row of domainScores) {
        if (row.domain) {
          scores[row.domain] = Number(row.domain_score);
        }
      }

      const passed = avg_score !== null && Number(avg_score) >= threshold;

      await sql`
        INSERT INTO learner.completions (user_id, course_slug, score, passed, domain_scores)
        VALUES (${userId}, ${courseSlug}, ${Number(avg_score)}, ${passed}, ${JSON.stringify(scores)})
        ON CONFLICT (user_id, course_slug) DO UPDATE SET
          score = EXCLUDED.score,
          passed = EXCLUDED.passed,
          domain_scores = EXCLUDED.domain_scores,
          completed_at = NOW()
      `;

      // Award course completion XP + badges
      const courseGamification = await recordCourseCompletion(sql, userId, courseSlug, passed);
      if (gamification) {
        gamification.xpEarned += courseGamification.xpEarned;
        gamification.totalXp += courseGamification.xpEarned;
        gamification.newBadges.push(...courseGamification.newBadges);
      }

      return NextResponse.json({
        completed: true,
        score: Number(avg_score),
        gamification,
      });
    }

    return NextResponse.json({ completed: false, gamification });
  } catch (error) {
    console.error("POST /api/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
