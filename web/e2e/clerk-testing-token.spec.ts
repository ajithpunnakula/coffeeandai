import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test.describe("Clerk testing token", () => {
  test("sign-in page loads with bot protection bypassed", async ({ page }) => {
    await setupClerkTestingToken({ page });

    await page.goto("/sign-in");

    await expect(page.locator(".cl-signIn-root, .cl-rootBox, [data-clerk-element]").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
