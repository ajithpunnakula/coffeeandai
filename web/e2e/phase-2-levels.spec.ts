import { test, expect } from "@playwright/test";

test.describe("Phase 2 — level pills on /browse", () => {
  test("topic-tile with three level pills renders for the demo-topic fixture", async ({
    page,
  }) => {
    await page.goto("/browse");

    // The Phase 2 fixture seeds three level variants of "demo-topic".
    const pills = page.locator(
      '[data-level-pill="basic"], [data-level-pill="intermediate"], [data-level-pill="advanced"]',
    );

    await expect(pills).toHaveCount(3, { timeout: 10_000 });
  });

  test("clicking a level pill opens the matching course", async ({ page }) => {
    await page.goto("/browse");
    const pill = page.locator('[data-level-pill="basic"]').first();
    await pill.click();
    await expect(page).toHaveURL(/\/courses\/demo-topic-basic/);
  });
});
