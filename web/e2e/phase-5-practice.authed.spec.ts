import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
import { LEARNER_STATE, hasLearnerAuth, NO_AUTH_REASON } from "./_helpers/auth";

// Pin the Phase-5 acceptance: even when a real authed learner runs through
// the practice modal end-to-end, learner.card_progress is not written. Every
// other Phase-5 invariant is held in vitest; this is the live, authed flavor.
test.describe("Phase 5 — running practice modal as authed learner writes 0 rows", () => {
  test.skip(!hasLearnerAuth(), NO_AUTH_REASON);

  test.use({ storageState: LEARNER_STATE });

  async function countCardProgressFor(displayName: string): Promise<number> {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for Phase-5 authed assertion");
    }
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT count(*)::int AS n
      FROM learner.card_progress cp
      JOIN learner.users u ON u.id = cp.user_id
      WHERE u.display_name = ${displayName}
    `;
    return Number(rows[0]?.n ?? 0);
  }

  test("/practice/preview interactions leave learner.card_progress untouched", async ({
    page,
  }) => {
    const before = await countCardProgressFor("Test Learner");

    await page.goto("/practice/preview");
    await expect(page.locator('[data-practice-modal="true"]')).toBeVisible({
      timeout: 10_000,
    });

    // Step through all seeded questions: pick a choice, advance.
    for (let i = 0; i < 3; i++) {
      await expect(
        page.locator(`[data-practice-question="${i}"]`),
      ).toBeVisible();
      await page.locator('[data-practice-choice="0"]').first().click();
      await page.locator('[data-action="practice-next"]').click();
    }

    await expect(
      page.locator('[data-practice-finished="true"]'),
    ).toBeVisible();
    await page.locator('[data-action="practice-close"]').click();
    await expect(page.locator('[data-preview-result]')).toBeVisible();

    const after = await countCardProgressFor("Test Learner");
    expect(after).toBe(before);
  });
});
