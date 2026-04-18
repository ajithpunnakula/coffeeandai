import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import DashboardClient from "./DashboardClient";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const sql = getDb();

  const courseRows = await sql`
    SELECT title, domains FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  if (!courseRows[0]) return notFound();

  const course = courseRows[0];
  const domains: { name: string; weight: number }[] =
    (typeof course.domains === "string"
      ? JSON.parse(course.domains)
      : course.domains) ?? [];

  const userRows = await sql`
    SELECT id FROM learner.users WHERE clerk_id = ${userId} LIMIT 1
  `;

  if (!userRows[0]) {
    // User hasn't started yet — redirect to course overview
    redirect(`/courses/${slug}`);
  }

  const dbUserId = userRows[0].id;

  // Fetch profile, progress stats, and event counts in parallel
  const [profileRows, progressRows, eventRows, completionRows, gamificationRows] =
    await Promise.all([
      sql`
        SELECT domain_mastery, weak_concepts, summary_md, updated_at
        FROM learner.profiles
        WHERE user_id = ${dbUserId} AND course_slug = ${slug}
        LIMIT 1
      `,
      sql`
        SELECT
          c.domain,
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE cp.status = 'completed')::int AS completed,
          AVG(cp.score) FILTER (WHERE cp.score IS NOT NULL) AS avg_score
        FROM content.cards c
        LEFT JOIN learner.card_progress cp ON cp.card_id = c.id AND cp.user_id = ${dbUserId}
        WHERE c.course_slug = ${slug}
        GROUP BY c.domain
      `,
      sql`
        SELECT COUNT(*)::int AS total_events,
               COUNT(*) FILTER (WHERE event_type = 'attempt')::int AS attempts,
               MIN(created_at) AS first_event,
               MAX(created_at) AS last_event
        FROM learner.card_events e
        JOIN content.cards c ON c.id = e.card_id
        WHERE e.user_id = ${dbUserId} AND c.course_slug = ${slug}
      `,
      sql`
        SELECT score, passed, domain_scores, completed_at
        FROM learner.completions
        WHERE user_id = ${dbUserId} AND course_slug = ${slug}
        ORDER BY completed_at DESC LIMIT 1
      `,
      sql`
        SELECT total_xp, current_streak, longest_streak, last_activity_date, badges
        FROM learner.users
        WHERE id = ${dbUserId}
      `,
    ]);

  const profile = profileRows[0]
    ? {
        domain_mastery:
          (typeof profileRows[0].domain_mastery === "string"
            ? JSON.parse(profileRows[0].domain_mastery)
            : profileRows[0].domain_mastery) ?? {},
        weak_concepts: profileRows[0].weak_concepts ?? [],
        summary_md: profileRows[0].summary_md ?? "",
        updated_at: profileRows[0].updated_at,
      }
    : null;

  const domainProgress = progressRows.map((r: any) => ({
    domain: r.domain ?? "General",
    total: Number(r.total),
    completed: Number(r.completed),
    avg_score: r.avg_score != null ? Number(r.avg_score) : null,
  }));

  const eventStats = eventRows[0]
    ? {
        total_events: Number(eventRows[0].total_events),
        attempts: Number(eventRows[0].attempts),
        first_event: eventRows[0].first_event,
        last_event: eventRows[0].last_event,
      }
    : null;

  const completion = completionRows[0]
    ? {
        score: Number(completionRows[0].score),
        passed: completionRows[0].passed,
        domain_scores:
          (typeof completionRows[0].domain_scores === "string"
            ? JSON.parse(completionRows[0].domain_scores)
            : completionRows[0].domain_scores) ?? {},
        completed_at: completionRows[0].completed_at,
      }
    : null;

  const gamification = gamificationRows[0]
    ? (() => {
        const g = gamificationRows[0];
        let currentStreak = g.current_streak ?? 0;
        if (g.last_activity_date && currentStreak > 0) {
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const last = new Date(g.last_activity_date);
          last.setUTCHours(0, 0, 0, 0);
          if (Math.floor((today.getTime() - last.getTime()) / 86400000) > 1) currentStreak = 0;
        }
        return {
          totalXp: g.total_xp ?? 0,
          currentStreak,
          longestStreak: g.longest_streak ?? 0,
          badges: g.badges ?? [],
        };
      })()
    : null;

  return (
    <DashboardClient
      courseSlug={slug}
      courseTitle={course.title}
      domains={domains}
      profile={profile}
      domainProgress={domainProgress}
      eventStats={eventStats}
      completion={completion}
      gamification={gamification}
    />
  );
}
