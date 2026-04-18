import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Profiler not configured" },
      { status: 503 },
    );
  }

  const sql = getDb();

  // Find users with 5+ new card_events since their last profile update
  const candidates = await sql`
    SELECT
      e.user_id,
      c.course_slug,
      COUNT(*)::int AS new_events
    FROM learner.card_events e
    JOIN content.cards c ON c.id = e.card_id
    LEFT JOIN learner.profiles p
      ON p.user_id = e.user_id AND p.course_slug = c.course_slug
    WHERE e.created_at > COALESCE(p.updated_at, '1970-01-01'::timestamptz)
    GROUP BY e.user_id, c.course_slug
    HAVING COUNT(*) >= 5
  `;

  let updated = 0;

  for (const candidate of candidates) {
    try {
      await updateProfile(sql, candidate.user_id, candidate.course_slug);
      updated++;
    } catch (err) {
      console.error(
        `Profiler error for user=${candidate.user_id} course=${candidate.course_slug}:`,
        err,
      );
    }
  }

  return NextResponse.json({ ok: true, profiles_updated: updated });
}

async function updateProfile(
  sql: any,
  userId: string,
  courseSlug: string,
): Promise<void> {
  // 1. Get card_progress with scores per domain
  const domainScores = await sql`
    SELECT
      c.domain,
      AVG(cp.score) AS avg_score,
      COUNT(*)::int AS card_count
    FROM learner.card_progress cp
    JOIN content.cards c ON c.id = cp.card_id
    WHERE cp.user_id = ${userId}
      AND c.course_slug = ${courseSlug}
      AND cp.status = 'completed'
      AND cp.score IS NOT NULL
    GROUP BY c.domain
  `;

  // 2. Get recent card_events (misconceptions, attempts)
  const recentEvents = await sql`
    SELECT
      c.title AS card_title,
      c.domain,
      e.event_type,
      e.payload,
      e.created_at
    FROM learner.card_events e
    JOIN content.cards c ON c.id = e.card_id
    WHERE e.user_id = ${userId}
      AND c.course_slug = ${courseSlug}
    ORDER BY e.created_at DESC
    LIMIT 50
  `;

  // Format data for the prompt
  const domainSummary = domainScores
    .map(
      (d: any) =>
        `${d.domain ?? "General"}: avg_score=${Number(d.avg_score).toFixed(2)}, cards=${d.card_count}`,
    )
    .join("\n");

  const misconceptions = recentEvents
    .filter(
      (e: any) =>
        e.event_type === "misconception" || e.event_type === "wrong_answer",
    )
    .map(
      (e: any) =>
        `- ${e.card_title} (${e.domain ?? "General"}): ${e.event_type} ${e.payload ? JSON.stringify(e.payload) : ""}`,
    )
    .slice(0, 20)
    .join("\n");

  const attemptPatterns = recentEvents
    .filter((e: any) => e.event_type === "attempt")
    .reduce(
      (acc: Record<string, number>, e: any) => {
        const key = e.domain ?? "General";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const attemptSummary = Object.entries(attemptPatterns)
    .map(([domain, count]) => `${domain}: ${count} attempts`)
    .join("\n");

  // 3. Call Claude Haiku
  const prompt = `Analyze this learner's performance data and return JSON only (no markdown, no explanation):
{
  "domain_mastery": {"Domain Name": 0.85, ...},
  "weak_concepts": ["concept1", "concept2"],
  "summary": "Natural language summary for tutor context..."
}

Learner data:
- Domain scores:
${domainSummary || "No domain data yet"}

- Recent misconceptions:
${misconceptions || "None"}

- Attempt patterns:
${attemptSummary || "No attempt data"}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Anthropic API error: ${resp.status} ${errBody}`);
  }

  const result = await resp.json();
  const text =
    result.content?.[0]?.type === "text" ? result.content[0].text : "";

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse profiler response: ${text}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const domainMastery = parsed.domain_mastery ?? {};
  const weakConcepts = parsed.weak_concepts ?? [];
  const summary = parsed.summary ?? "";

  // 4. Upsert into learner.profiles
  await sql`
    INSERT INTO learner.profiles (user_id, course_slug, domain_mastery, weak_concepts, summary_md, updated_at)
    VALUES (
      ${userId},
      ${courseSlug},
      ${JSON.stringify(domainMastery)},
      ${JSON.stringify(weakConcepts)},
      ${summary},
      NOW()
    )
    ON CONFLICT (user_id, course_slug) DO UPDATE SET
      domain_mastery = EXCLUDED.domain_mastery,
      weak_concepts = EXCLUDED.weak_concepts,
      summary_md = EXCLUDED.summary_md,
      updated_at = NOW()
  `;
}
