import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  // Aggregate card_events into card_metrics
  await sql`
    INSERT INTO content.card_metrics (card_id, attempts, pass_rate, avg_attempts, avg_time_seconds, skip_rate, misconception_hit_rates, flagged, flag_reason, updated_at)
    SELECT
      cp.card_id,
      COUNT(DISTINCT e.id)::int AS attempts,
      AVG(CASE WHEN cp.status = 'completed' AND cp.score >= 0.5 THEN 1.0 ELSE 0.0 END) AS pass_rate,
      COALESCE(AVG(attempt_counts.cnt), 1) AS avg_attempts,
      AVG((e.payload->>'time_ms')::numeric / 1000) AS avg_time_seconds,
      AVG(CASE WHEN cp.status = 'not_started' THEN 1.0 ELSE 0.0 END) AS skip_rate,
      '{}'::jsonb AS misconception_hit_rates,
      false AS flagged,
      NULL AS flag_reason,
      now()
    FROM learner.card_progress cp
    LEFT JOIN learner.card_events e ON e.card_id = cp.card_id AND e.user_id = cp.user_id
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt FROM learner.card_events
      WHERE card_id = cp.card_id AND user_id = cp.user_id AND event_type = 'attempt'
    ) attempt_counts ON true
    GROUP BY cp.card_id
    ON CONFLICT (card_id) DO UPDATE SET
      attempts = EXCLUDED.attempts,
      pass_rate = EXCLUDED.pass_rate,
      avg_attempts = EXCLUDED.avg_attempts,
      avg_time_seconds = EXCLUDED.avg_time_seconds,
      skip_rate = EXCLUDED.skip_rate,
      updated_at = now()
  `;

  // Flag problematic cards
  await sql`
    UPDATE content.card_metrics SET
      flagged = true,
      flag_reason = CASE
        WHEN pass_rate > 0.95 THEN 'too easy'
        WHEN pass_rate < 0.30 THEN 'too hard'
        WHEN skip_rate > 0.20 THEN 'disengaging'
        WHEN avg_time_seconds < 5 THEN 'not reading'
        ELSE NULL
      END
    WHERE pass_rate > 0.95 OR pass_rate < 0.30 OR skip_rate > 0.20 OR avg_time_seconds < 5
  `;

  // Compute domain metrics
  await sql`
    INSERT INTO content.domain_metrics (course_slug, domain, avg_score, sample_size, updated_at)
    SELECT
      c.course_slug,
      c.domain,
      AVG(cp.score) AS avg_score,
      COUNT(DISTINCT cp.user_id)::int AS sample_size,
      now()
    FROM content.cards c
    JOIN learner.card_progress cp ON cp.card_id = c.id
    WHERE cp.status = 'completed'
    GROUP BY c.course_slug, c.domain
    ON CONFLICT (course_slug, domain) DO UPDATE SET
      avg_score = EXCLUDED.avg_score,
      sample_size = EXCLUDED.sample_size,
      updated_at = now()
  `;

  // Merge LLM quality scores with human metrics into card_quality
  // LLM scores come from eval-report.json via publish or manual import.
  // Human signals come from card_metrics computed above.
  // Combined score = 0.6 * avg(LLM scores) + 0.4 * human_signal_score
  await sql`
    INSERT INTO content.card_quality (
      card_id, human_pass_rate, human_skip_rate, human_avg_time,
      combined_score, feedback, evaluated_at
    )
    SELECT
      cm.card_id,
      cm.pass_rate,
      cm.skip_rate,
      cm.avg_time_seconds,
      -- combined_score: blend existing LLM avg with human signal
      CASE
        WHEN cq.llm_clarity IS NOT NULL THEN
          0.6 * (
            COALESCE(cq.llm_clarity, 5) +
            COALESCE(cq.llm_accuracy, 5) +
            COALESCE(cq.llm_alignment, 5) +
            COALESCE(cq.llm_conciseness, 5)
          ) / 4.0
          + 0.4 * (
            -- Human signal: pass_rate * 10, penalize high skip and low time
            GREATEST(0, LEAST(10,
              COALESCE(cm.pass_rate, 0.5) * 10
              - CASE WHEN cm.skip_rate > 0.2 THEN 2 ELSE 0 END
              - CASE WHEN cm.avg_time_seconds < 5 THEN 2 ELSE 0 END
            ))
          )
        ELSE NULL
      END,
      -- feedback: auto-generate flag reason
      CASE
        WHEN cm.pass_rate < 0.30 THEN 'Low pass rate — consider simplifying or rewriting'
        WHEN cm.skip_rate > 0.20 THEN 'High skip rate — card may be disengaging'
        WHEN cm.avg_time_seconds < 5 THEN 'Very low time spent — card may be too shallow'
        ELSE NULL
      END,
      now()
    FROM content.card_metrics cm
    LEFT JOIN content.card_quality cq ON cq.card_id = cm.card_id
    WHERE cm.attempts > 0
    ON CONFLICT (card_id) DO UPDATE SET
      human_pass_rate = EXCLUDED.human_pass_rate,
      human_skip_rate = EXCLUDED.human_skip_rate,
      human_avg_time = EXCLUDED.human_avg_time,
      combined_score = EXCLUDED.combined_score,
      feedback = EXCLUDED.feedback,
      evaluated_at = EXCLUDED.evaluated_at
  `;

  return NextResponse.json({ ok: true });
}
