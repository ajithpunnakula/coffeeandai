import { test, expect } from "@playwright/test";

test.describe("404 page", () => {
  test("unknown routes do not return a server error", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBeLessThan(500);
  });

  test("static assets return without server error", async ({ page }) => {
    const response = await page.goto("/favicon.png");
    expect(response?.status()).toBeLessThan(500);
  });

  test("apple-touch-icon requests do not return 500", async ({ page }) => {
    const response = await page.goto("/apple-touch-icon.png");
    expect(response?.status()).toBeLessThan(500);
  });
});
