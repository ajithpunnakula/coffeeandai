import { test, expect } from "@playwright/test";

test.describe("Whole-tile click targets", () => {
  test("/paths/[slug]: clicking the unlocked row body navigates to the course", async ({
    page,
  }) => {
    await page.goto("/paths/demo-path");

    // First demo course is unlocked. The whole row is now a Link, so clicking
    // the title (not the right-side "Open" badge) should navigate.
    const row = page.locator('[data-course-slug="demo-topic-basic"]').first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await row.getByText("Demo Topic — Basic").click();
    await expect(page).toHaveURL(/\/courses\/demo-topic-basic/);
  });

  test("/browse multi-level tile: clicking the card body opens the level popover", async ({
    page,
  }) => {
    await page.goto("/browse?tab=courses");

    const card = page
      .locator('[data-multi-level-card="true"]')
      .filter({ hasText: "Demo Topic" })
      .first();
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Click on the card body (the title h3) — not on a level pill.
    await card.getByRole("heading", { name: /Demo Topic/i }).click();

    const popover = card.locator('[data-multi-level-popover="true"]');
    await expect(popover).toBeVisible();
    await expect(popover.getByText("Choose a level")).toBeVisible();

    // Picking a level from the popover navigates.
    await popover.locator('[data-popover-level="basic"]').click();
    await expect(page).toHaveURL(/\/courses\/demo-topic-basic/);
  });

  test("/browse multi-level tile: inline level pill still navigates directly", async ({
    page,
  }) => {
    await page.goto("/browse?tab=courses");
    const pill = page.locator('[data-level-pill="intermediate"]').first();
    await expect(pill).toBeVisible({ timeout: 10_000 });
    await pill.click();
    await expect(page).toHaveURL(/\/courses\/demo-topic-intermediate/);
  });
});
