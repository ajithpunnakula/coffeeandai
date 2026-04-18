import type { NeonQueryFunction } from "@neondatabase/serverless";

// --- XP values ---

const CARD_XP: Record<string, number> = {
  page: 10,
  reflection: 15,
  quiz: 20,
  scenario: 25,
};

const QUIZ_SCORE_BONUS_MAX = 30;
const PERFECT_QUIZ_BONUS = 50;
const COURSE_COMPLETE_XP = 200;
const COURSE_PASS_BONUS = 300;
const STREAK_7_BONUS = 100;
const STREAK_30_BONUS = 500;

// --- Badge definitions ---

export interface Badge {
  id: string;
  name: string;
  icon: string;
  hint: string;
}

export const BADGE_DEFS: Badge[] = [
  { id: "first_card", name: "First Steps", icon: "👣", hint: "Complete your first card" },
  { id: "first_course", name: "Graduate", icon: "🎓", hint: "Complete a course" },
  { id: "perfect_quiz", name: "Perfectionist", icon: "💯", hint: "Score 100% on any quiz" },
  { id: "streak_7", name: "On Fire", icon: "🔥", hint: "Reach a 7-day streak" },
  { id: "streak_30", name: "Inferno", icon: "🌋", hint: "Reach a 30-day streak" },
  { id: "all_domains", name: "Renaissance", icon: "🏆", hint: "Score 80%+ in all domains" },
  { id: "speed_demon", name: "Speed Demon", icon: "⚡", hint: "Complete a course in one day" },
  { id: "triple_crown", name: "Triple Crown", icon: "👑", hint: "Complete 3 courses" },
];

// --- Core functions ---

export interface GamificationResult {
  xpEarned: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  newBadges: Array<{ id: string; name: string; icon: string }>;
}

export async function recordCardCompletion(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  cardId: string,
  cardType: string,
  score: number | null,
): Promise<GamificationResult> {
  let xpEarned = 0;
  const newBadges: Array<{ id: string; name: string; icon: string }> = [];

  // 1. Base XP for card type
  const baseXp = CARD_XP[cardType] ?? 10;
  xpEarned += baseXp;

  // 2. Quiz/scenario score bonus
  if (score != null && (cardType === "quiz" || cardType === "scenario")) {
    xpEarned += Math.floor(score * QUIZ_SCORE_BONUS_MAX);
    if (score >= 1.0) {
      xpEarned += PERFECT_QUIZ_BONUS;
    }
  }

  // 3. Award XP
  await awardXp(sql, userId, xpEarned, "card_complete", cardId);

  // 4. Update streak
  const streak = await updateStreak(sql, userId);

  // 5. Streak milestone bonuses
  if (streak.current === 7 && streak.justIncremented) {
    await awardXp(sql, userId, STREAK_7_BONUS, "streak_bonus", "streak_7");
    xpEarned += STREAK_7_BONUS;
  }
  if (streak.current === 30 && streak.justIncremented) {
    await awardXp(sql, userId, STREAK_30_BONUS, "streak_bonus", "streak_30");
    xpEarned += STREAK_30_BONUS;
  }

  // 6. Check badges
  const earned = await checkBadges(sql, userId, { cardType, score, streak: streak.current });
  newBadges.push(...earned);

  // 7. Get updated totals
  const userRow = await sql`SELECT total_xp, current_streak, longest_streak FROM learner.users WHERE id = ${userId}`;
  const user = userRow[0];

  return {
    xpEarned,
    currentStreak: user.current_streak,
    longestStreak: user.longest_streak,
    totalXp: user.total_xp,
    newBadges,
  };
}

export async function recordCourseCompletion(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  courseSlug: string,
  passed: boolean,
): Promise<{ xpEarned: number; newBadges: Array<{ id: string; name: string; icon: string }> }> {
  let xpEarned = COURSE_COMPLETE_XP;
  await awardXp(sql, userId, COURSE_COMPLETE_XP, "course_complete", courseSlug);

  if (passed) {
    xpEarned += COURSE_PASS_BONUS;
    await awardXp(sql, userId, COURSE_PASS_BONUS, "course_pass", courseSlug);
  }

  const newBadges = await checkBadges(sql, userId, { courseCompleted: true, courseSlug });

  return { xpEarned, newBadges };
}

export async function getStreakAndXp(
  sql: NeonQueryFunction<false, false>,
  userId: string,
): Promise<{ currentStreak: number; longestStreak: number; totalXp: number; badges: Array<{ id: string; earned_at: string }> }> {
  const rows = await sql`
    SELECT total_xp, current_streak, longest_streak, last_activity_date, badges
    FROM learner.users WHERE id = ${userId}
  `;
  if (rows.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalXp: 0, badges: [] };
  }
  const user = rows[0];

  // Check if streak is still valid (might have broken since last activity)
  let currentStreak = user.current_streak ?? 0;
  if (user.last_activity_date) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const lastActivity = new Date(user.last_activity_date);
    lastActivity.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / 86400000);
    if (diffDays > 1) {
      // Streak is broken but we don't update DB here — it'll reset on next activity
      currentStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: user.longest_streak ?? 0,
    totalXp: user.total_xp ?? 0,
    badges: user.badges ?? [],
  };
}

// --- Internal helpers ---

async function awardXp(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  xp: number,
  reason: string,
  sourceId: string,
) {
  await sql`
    INSERT INTO learner.xp_events (user_id, xp, reason, source_id)
    VALUES (${userId}, ${xp}, ${reason}, ${sourceId})
  `;
  await sql`
    UPDATE learner.users SET total_xp = total_xp + ${xp} WHERE id = ${userId}
  `;
}

interface StreakResult {
  current: number;
  longest: number;
  justIncremented: boolean;
}

async function updateStreak(
  sql: NeonQueryFunction<false, false>,
  userId: string,
): Promise<StreakResult> {
  // Upsert activity day
  await sql`
    INSERT INTO learner.activity_days (user_id, activity_date, cards_completed)
    VALUES (${userId}, CURRENT_DATE, 1)
    ON CONFLICT (user_id, activity_date)
    DO UPDATE SET cards_completed = learner.activity_days.cards_completed + 1
  `;

  // Get current streak state
  const rows = await sql`
    SELECT current_streak, longest_streak, last_activity_date
    FROM learner.users WHERE id = ${userId}
  `;
  const user = rows[0];
  const lastDate = user.last_activity_date;
  let newStreak = user.current_streak ?? 0;
  let justIncremented = false;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (lastDate) {
    const last = new Date(lastDate);
    last.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);

    if (diffDays === 0) {
      // Already active today — no streak change
    } else if (diffDays === 1) {
      newStreak += 1;
      justIncremented = true;
    } else {
      newStreak = 1;
      justIncremented = true;
    }
  } else {
    newStreak = 1;
    justIncremented = true;
  }

  const newLongest = Math.max(user.longest_streak ?? 0, newStreak);

  await sql`
    UPDATE learner.users
    SET current_streak = ${newStreak},
        longest_streak = ${newLongest},
        last_activity_date = CURRENT_DATE
    WHERE id = ${userId}
  `;

  return { current: newStreak, longest: newLongest, justIncremented };
}

async function checkBadges(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  context: {
    cardType?: string;
    score?: number | null;
    streak?: number;
    courseCompleted?: boolean;
    courseSlug?: string;
  },
): Promise<Array<{ id: string; name: string; icon: string }>> {
  const rows = await sql`SELECT badges FROM learner.users WHERE id = ${userId}`;
  const existing: Array<{ id: string }> = rows[0]?.badges ?? [];
  const earnedIds = new Set(existing.map((b) => b.id));
  const newBadges: Array<{ id: string; name: string; icon: string }> = [];

  async function grant(id: string) {
    if (earnedIds.has(id)) return;
    const def = BADGE_DEFS.find((b) => b.id === id);
    if (!def) return;
    earnedIds.add(id);
    newBadges.push({ id: def.id, name: def.name, icon: def.icon });
  }

  // First card
  if (!earnedIds.has("first_card")) {
    const count = await sql`SELECT COUNT(*) AS n FROM learner.card_progress WHERE user_id = ${userId} AND status = 'completed'`;
    if (Number(count[0].n) >= 1) await grant("first_card");
  }

  // Perfect quiz
  if (context.cardType === "quiz" && context.score != null && context.score >= 1.0) {
    await grant("perfect_quiz");
  }

  // Streak badges
  if (context.streak != null) {
    if (context.streak >= 7) await grant("streak_7");
    if (context.streak >= 30) await grant("streak_30");
  }

  // Course completion badges
  if (context.courseCompleted) {
    await grant("first_course");

    // Triple crown: 3+ courses completed
    if (!earnedIds.has("triple_crown")) {
      const completions = await sql`SELECT COUNT(DISTINCT course_slug) AS n FROM learner.completions WHERE user_id = ${userId}`;
      if (Number(completions[0].n) >= 3) await grant("triple_crown");
    }

    // Speed demon: course started and completed same day
    if (context.courseSlug && !earnedIds.has("speed_demon")) {
      const enrollment = await sql`
        SELECT started_at FROM learner.enrollments
        WHERE user_id = ${userId} AND course_slug = ${context.courseSlug}
      `;
      if (enrollment.length > 0) {
        const started = new Date(enrollment[0].started_at);
        const now = new Date();
        started.setUTCHours(0, 0, 0, 0);
        now.setUTCHours(0, 0, 0, 0);
        if (started.getTime() === now.getTime()) await grant("speed_demon");
      }
    }

    // All domains: 80%+ in every domain
    if (context.courseSlug && !earnedIds.has("all_domains")) {
      const domainScores = await sql`
        SELECT c.domain, AVG(cp.score) AS avg_score
        FROM content.cards c
        JOIN learner.card_progress cp ON cp.card_id = c.id AND cp.user_id = ${userId}
        WHERE c.course_slug = ${context.courseSlug} AND cp.score IS NOT NULL
        GROUP BY c.domain
      `;
      if (domainScores.length > 0 && domainScores.every((d: any) => Number(d.avg_score) >= 0.8)) {
        await grant("all_domains");
      }
    }
  }

  // Persist new badges
  if (newBadges.length > 0) {
    const updatedBadges = [
      ...existing,
      ...newBadges.map((b) => ({ id: b.id, earned_at: new Date().toISOString() })),
    ];
    await sql`UPDATE learner.users SET badges = ${JSON.stringify(updatedBadges)} WHERE id = ${userId}`;
  }

  return newBadges;
}
