import { test, expect } from "@playwright/test";

test.describe("Courses page", () => {
  test("displays at least one published course", async ({ page }) => {
    await page.goto("/courses");
    const courseCards = page.locator("h2");
    await expect(courseCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("course card has enroll link", async ({ page }) => {
    await page.goto("/courses");
    const enrollLink = page.locator('a:has-text("Enroll")');
    await expect(enrollLink.first()).toBeVisible({ timeout: 10000 });
  });
});
