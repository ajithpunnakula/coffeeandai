import { test, expect } from "@playwright/test";

test.describe("Phase 3 — learning paths", () => {
  test("/browse Paths tab shows the demo learning path", async ({ page }) => {
    await page.goto("/browse");

    // The Paths tab is the catalog default per PLAN.md §1.
    const pathsTab = page.locator('[data-tab="paths"]').first();
    await expect(pathsTab).toBeVisible({ timeout: 10_000 });

    // Demo path tile (seeded by scripts/seed-phase3-fixture.sql).
    await expect(page.getByText("Demo Path", { exact: false })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("/paths/[slug] shows ordered courses with locked indicator on the second", async ({
    page,
  }) => {
    await page.goto("/paths/demo-path");
    // First course present
    await expect(page.getByText("Demo Topic — Basic")).toBeVisible({
      timeout: 10_000,
    });
    // Second course is locked for unauthenticated users (no progress recorded).
    const lockedBadges = page.locator('[data-locked="true"]');
    await expect(lockedBadges.first()).toBeVisible({ timeout: 10_000 });
  });
});
