import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
import { AUTHOR_STATE, hasAuthorAuth } from "./_helpers/auth";

// Cost-bounded live LLM smoke runs. Skipped by default — opt in with
// SMOKE_LLM=1. Intended to be run by hand once per release; the costs are
// small (gpt-4o-mini) but real, so we don't run it in CI.
//
// To run:
//   eval "$(npx tsx ../scripts/seed-test-users.ts | sed 's/^/export /')"
//   SMOKE_LLM=1 PLAYWRIGHT_BASE_URL=https://coffeeandai.xyz \
//     npx playwright test e2e/smoke-llm-prod.spec.ts
test.describe("Live LLM smoke runs", () => {
  test.skip(
    process.env.SMOKE_LLM !== "1",
    "Set SMOKE_LLM=1 to opt into live LLM smoke runs (costs apply).",
  );
  test.skip(
    !hasAuthorAuth(),
    "Author storageState missing. Run scripts/seed-test-users.ts first.",
  );
  test.use({ storageState: AUTHOR_STATE });
  // Each generate stream takes 30–60s; running three in parallel and the
  // path proposal sequentially keeps total wall time under ~3 minutes.
  test.setTimeout(360_000);

  const TOPIC = "Kubernetes";
  const TOPIC_KEY = "kubernetes";
  const LEVELS: Array<"basic" | "intermediate" | "advanced"> = [
    "basic",
    "intermediate",
    "advanced",
  ];
  const EXPECTED_SLUGS = LEVELS.map((l) => `${TOPIC_KEY}-${l}`);

  test.beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;
    const sql = neon(process.env.DATABASE_URL);
    // Drafts only — we never publish during smoke. Cleanup is per-run so
    // the script is idempotent.
    await sql`
      DELETE FROM content.card_drafts
      WHERE course_slug = ANY(${EXPECTED_SLUGS})
    `;
    await sql`
      DELETE FROM content.course_drafts
      WHERE slug = ANY(${EXPECTED_SLUGS})
    `;
  });

  test.afterAll(async () => {
    if (!process.env.DATABASE_URL) return;
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      DELETE FROM content.card_drafts
      WHERE course_slug = ANY(${EXPECTED_SLUGS})
    `;
    await sql`
      DELETE FROM content.course_drafts
      WHERE slug = ANY(${EXPECTED_SLUGS})
    `;
  });

  test("Phase 2: 'Kubernetes — All three' creates 3 drafts sharing topic_key", async ({
    request,
  }) => {
    // Fan out the same way /studio/courses/new does — three parallel
    // streamed POSTs, one per level. We don't need to consume the SSE
    // event-by-event; the response closes when generation is complete.
    const t0 = Date.now();
    const responses = await Promise.all(
      LEVELS.map((level) =>
        request.post("/api/studio/generate", {
          data: { topic: TOPIC, level },
          timeout: 300_000,
        }),
      ),
    );
    const elapsedMs = Date.now() - t0;
    for (const res of responses) {
      expect(
        res.ok(),
        `generate failed status=${res.status()} ${await res.text()}`,
      ).toBe(true);
    }

    // Verify DB state.
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT slug, level, topic_key
      FROM content.course_drafts
      WHERE topic_key = ${TOPIC_KEY}
      ORDER BY level
    `;
    expect(rows.length, JSON.stringify(rows)).toBe(3);
    const slugs = rows.map((r) => String(r.slug)).sort();
    const levels = rows.map((r) => String(r.level)).sort();
    expect(slugs).toEqual(EXPECTED_SLUGS.slice().sort());
    expect(levels).toEqual(["advanced", "basic", "intermediate"]);
    for (const r of rows) {
      expect(r.topic_key).toBe(TOPIC_KEY);
    }

    console.log(
      `[smoke-llm] phase-2 'Kubernetes' x 3 levels: ${rows.length} drafts, ${(elapsedMs / 1000).toFixed(1)}s wall.`,
    );
  });

  test("Phase 4: /api/studio/paths/propose returns 3–6 ordered courses for a real topic", async ({
    request,
  }) => {
    const t0 = Date.now();
    const res = await request.post("/api/studio/paths/propose", {
      data: {
        topic: "Kubernetes",
        audience: "platform engineers",
      },
      timeout: 60_000,
    });
    expect(
      res.ok(),
      `propose failed status=${res.status()} ${await res.text()}`,
    ).toBe(true);
    const proposal = await res.json();
    expect(Array.isArray(proposal.courses)).toBe(true);
    expect(proposal.courses.length).toBeGreaterThanOrEqual(3);
    expect(proposal.courses.length).toBeLessThanOrEqual(6);
    // Position should be 1..N strictly increasing.
    for (let i = 0; i < proposal.courses.length; i++) {
      expect(proposal.courses[i].position).toBe(i + 1);
      expect(typeof proposal.courses[i].title).toBe("string");
      expect(["basic", "intermediate", "advanced"]).toContain(
        proposal.courses[i].level,
      );
    }
    const elapsedMs = Date.now() - t0;
    console.log(
      `[smoke-llm] phase-4 paths/propose: ${proposal.courses.length} courses, ${(elapsedMs / 1000).toFixed(1)}s wall.`,
    );
  });
});
