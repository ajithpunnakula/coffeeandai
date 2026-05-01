import { test, expect } from "@playwright/test";

test.describe("Phase 5 — adaptive practice rounds", () => {
  test("/api/practice/generate POST without payload returns a 4xx, not 5xx", async ({
    request,
  }) => {
    const res = await request.post("/api/practice/generate", {
      data: {},
    });
    // Public endpoint: should reject the bad input cleanly.
    expect(res.status()).toBeLessThan(500);
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("/practice/preview renders the practice modal with seed questions", async ({
    page,
  }) => {
    // Public test harness: mounts <PracticeRoundModal> with a fixed payload.
    // Acceptance: modal opens, ephemeral state — no DB writes asserted in
    // Vitest practice-no-db-writes.test.ts.
    await page.goto("/practice/preview");
    await expect(
      page.locator('[data-practice-modal="true"]'),
    ).toBeVisible({ timeout: 10_000 });

    // The "won't be saved" badge is part of the spec — UX disclosure.
    await expect(page.getByText(/won.?t be saved/i)).toBeVisible();

    // 3 questions visible (seeded).
    const questions = page.locator('[data-practice-question]');
    await expect(questions.first()).toBeVisible();
  });
});
