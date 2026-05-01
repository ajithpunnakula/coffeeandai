import { test, expect } from "@playwright/test";

test.describe("Browse catalog page", () => {
  test("displays at least one published course", async ({ page }) => {
    await page.goto("/browse");
    const courseCards = page.locator("h2, h3");
    await expect(courseCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("course tile links to course detail", async ({ page }) => {
    await page.goto("/browse");
    const courseLink = page.locator('a[href^="/courses/"]').first();
    await expect(courseLink).toBeVisible({ timeout: 10000 });
  });
});
