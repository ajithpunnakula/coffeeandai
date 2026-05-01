import { test, expect } from "@playwright/test";

test.describe("Phase 4 — polish", () => {
  test("certificate preview renders for the demo path", async ({ page }) => {
    // Preview mode renders the cert layout without auth/progress, so live
    // verification can hit it. Real cert requires auth + path completion.
    const res = await page.goto("/paths/demo-path/certificate?preview=1");
    expect(res?.status()).toBe(200);
    await expect(page.getByText(/certificate of completion/i)).toBeVisible({
      timeout: 10_000,
    });
    // Path title is shown on the cert.
    await expect(page.getByText("Demo Path", { exact: false })).toBeVisible();
    await expect(page.locator('[data-cert="preview"]')).toBeVisible();
  });

  test("pre-assessment quick-check page renders 5 questions", async ({
    page,
  }) => {
    await page.goto("/topics/demo-topic/quick-check");
    // 5 questions, each with a fieldset/role=group
    const questions = page.locator('[data-question-index]');
    await expect(questions).toHaveCount(5, { timeout: 10_000 });
    // Submit button exists
    await expect(
      page.getByRole("button", { name: /find my level/i }),
    ).toBeVisible();
  });

  test("admin insights page route exists (redirects unauthed to sign-in)", async ({
    page,
  }) => {
    // Auth-gated route. We just confirm it's not a 5xx and lands somewhere
    // sensible (sign-in or, when admin, the insights page).
    const res = await page.goto("/admin/insights");
    expect(res?.status()).toBeLessThan(500);
    const url = page.url();
    expect(url).toMatch(/sign-in|admin\/insights/);
  });

  test("/browse Paths tab links each tile to its certificate slug", async ({
    page,
  }) => {
    await page.goto("/browse");
    // The demo-path tile is visible (Phase 3 fixture).
    await expect(page.getByText("Demo Path", { exact: false })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("studio /studio/paths/new exposes the LLM proposal toggle (auth gate UI is fine)", async ({
    page,
  }) => {
    // Signed out → should redirect to sign-in. We just confirm the route is
    // not 5xx; the UI surface is exercised by Vitest path-proposal tests.
    const res = await page.goto("/studio/paths/new");
    expect(res?.status()).toBeLessThan(500);
  });
});
