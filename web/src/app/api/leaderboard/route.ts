import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    const sql = getDb();
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope") ?? "overall";
    const slug = url.searchParams.get("slug");
    const period = url.searchParams.get("period") ?? "alltime";

    if (scope === "course" && slug) {
      // Course-level: top scores for completions
      const top = await sql`
        SELECT u.display_name, c.score, c.completed_at, u.current_streak
        FROM learner.completions c
        JOIN learner.users u ON u.id = c.user_id
        WHERE c.course_slug = ${slug} AND c.passed = true
        ORDER BY c.score DESC, c.completed_at ASC
        LIMIT 10
      `;

      let userRank = null;
      let userEntry = null;
      if (clerkId) {
        const rankRows = await sql`
          SELECT
            (SELECT COUNT(*) + 1 FROM learner.completions c2
             JOIN learner.users u2 ON u2.id = c2.user_id
             WHERE c2.course_slug = ${slug} AND c2.passed = true
               AND c2.score > c.score) AS rank,
            c.score,
            u.display_name
          FROM learner.completions c
          JOIN learner.users u ON u.id = c.user_id
          WHERE u.clerk_id = ${clerkId} AND c.course_slug = ${slug}
          LIMIT 1
        `;
        if (rankRows.length > 0) {
          userRank = Number(rankRows[0].rank);
          userEntry = { displayName: rankRows[0].display_name, score: rankRows[0].score, rank: userRank };
        }
      }

      return NextResponse.json({
        scope: "course",
        slug,
        entries: top.map((r, i) => ({
          rank: i + 1,
          displayName: r.display_name ?? "Learner",
          score: Number(r.score),
          streak: r.current_streak ?? 0,
        })),
        userEntry,
      });
    }

    // Overall leaderboard
    if (period === "weekly") {
      const top = await sql`
        SELECT u.display_name, u.current_streak, SUM(x.xp)::int AS xp
        FROM learner.xp_events x
        JOIN learner.users u ON u.id = x.user_id
        WHERE x.created_at >= date_trunc('week', CURRENT_DATE)
        GROUP BY u.id, u.display_name, u.current_streak
        ORDER BY xp DESC
        LIMIT 10
      `;

      let userRank = null;
      let userEntry = null;
      if (clerkId) {
        const rankRows = await sql`
          WITH weekly AS (
            SELECT user_id, SUM(xp)::int AS xp
            FROM learner.xp_events
            WHERE created_at >= date_trunc('week', CURRENT_DATE)
            GROUP BY user_id
          )
          SELECT
            (SELECT COUNT(*) + 1 FROM weekly w2 WHERE w2.xp > w.xp) AS rank,
            w.xp,
            u.display_name
          FROM weekly w
          JOIN learner.users u ON u.id = w.user_id
          WHERE u.clerk_id = ${clerkId}
          LIMIT 1
        `;
        if (rankRows.length > 0) {
          userRank = Number(rankRows[0].rank);
          userEntry = { displayName: rankRows[0].display_name, xp: Number(rankRows[0].xp), rank: userRank };
        }
      }

      return NextResponse.json({
        scope: "overall",
        period: "weekly",
        entries: top.map((r, i) => ({
          rank: i + 1,
          displayName: r.display_name ?? "Learner",
          xp: Number(r.xp),
          streak: r.current_streak ?? 0,
        })),
        userEntry,
      });
    }

    // All-time
    const top = await sql`
      SELECT display_name, total_xp, current_streak
      FROM learner.users
      WHERE total_xp > 0
      ORDER BY total_xp DESC
      LIMIT 10
    `;

    let userRank = null;
    let userEntry = null;
    if (clerkId) {
      const rankRows = await sql`
        SELECT
          (SELECT COUNT(*) + 1 FROM learner.users u2 WHERE u2.total_xp > u.total_xp) AS rank,
          u.total_xp,
          u.display_name
        FROM learner.users u
        WHERE u.clerk_id = ${clerkId}
        LIMIT 1
      `;
      if (rankRows.length > 0 && Number(rankRows[0].total_xp) > 0) {
        userRank = Number(rankRows[0].rank);
        userEntry = { displayName: rankRows[0].display_name, xp: Number(rankRows[0].total_xp), rank: userRank };
      }
    }

    return NextResponse.json({
      scope: "overall",
      period: "alltime",
      entries: top.map((r, i) => ({
        rank: i + 1,
        displayName: r.display_name ?? "Learner",
        xp: Number(r.total_xp),
        streak: r.current_streak ?? 0,
      })),
      userEntry,
    });
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
