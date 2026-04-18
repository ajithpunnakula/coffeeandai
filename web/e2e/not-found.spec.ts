import { test, expect } from "@playwright/test";

test.describe("404 page", () => {
  test("unknown routes do not return a server error", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBeLessThan(500);
  });

  test("static assets return without server error", async ({ page }) => {
    const response = await page.goto("/favicon.png");
    // Should be 200 (exists) or 404 (not found), never 500
    expect(response?.status()).toBeLessThan(500);
  });
});
