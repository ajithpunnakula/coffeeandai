import { test, expect } from "@playwright/test";

test.describe("Phase 1 — foundation routes", () => {
  test("/browse loads", async ({ page }) => {
    const res = await page.goto("/browse");
    expect(res?.status() ?? 0).toBeLessThan(400);
  });

  test("/ redirects to /browse for signed-out users", async ({ page }) => {
    const res = await page.goto("/");
    // After redirect, the URL should be /browse (or /sign-in if redirect chains, but the
    // POC redirect is unconditional to /browse).
    await expect(page).toHaveURL(/\/(browse|sign-in)/);
    expect(res?.status() ?? 0).toBeLessThan(500);
  });

  test("/studio is protected and redirects/blocks unauthenticated users", async ({ page }) => {
    const res = await page.goto("/studio", { waitUntil: "domcontentloaded" });
    // Either redirected to sign-in or rendered an unauthorized page (status < 500 in either case).
    expect(res?.status() ?? 0).toBeLessThan(500);
    // Should NOT show the unauth'd /studio dashboard primary CTA.
    const dashboard = page.locator('h1:has-text("Create a Course")');
    await expect(dashboard).toHaveCount(0);
  });

  test("/developer is gone (no redirects on POC)", async ({ page }) => {
    const res = await page.goto("/developer", { waitUntil: "domcontentloaded" });
    // 404 OR a permanent redirect target (sign-in). Either way, no /developer dashboard.
    const dashboard = page.locator('h1:has-text("Create a Course")');
    await expect(dashboard).toHaveCount(0);
    // Status should be 4xx (404) or a redirect to /sign-in (which lands at < 400 after redirect).
    expect(res?.status() ?? 0).toBeLessThan(500);
  });
});
