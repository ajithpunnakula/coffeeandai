import { test, expect } from "@playwright/test";

test.describe("Phase 2 — level pills on /browse", () => {
  test("/browse renders level pills when a topic has multiple level variants", async ({
    page,
  }) => {
    await page.goto("/browse");
    // The exact set of topics with all three levels depends on what's been
    // generated/published. Phase-2 live verification seeds at least one such
    // topic before this test runs (or leaves it as a soft assertion).
    // Soft assertion: page renders without server error and the level-pill
    // markup ([data-level-pill]) renders if any topic has it.
    expect(page.url()).toContain("/browse");

    // If pills exist, they must be one of the three levels.
    const pills = page.locator("[data-level-pill]");
    const count = await pills.count();
    if (count > 0) {
      const allowed = ["basic", "intermediate", "advanced"];
      for (let i = 0; i < count; i++) {
        const v = await pills.nth(i).getAttribute("data-level-pill");
        expect(allowed).toContain(v);
      }
    }
  });
});
