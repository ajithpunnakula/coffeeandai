import { test, expect } from "@playwright/test";
import { LEARNER_STATE, hasLearnerAuth, NO_AUTH_REASON } from "./_helpers/auth";

// Phase-4 cert flow against the existing demo-path fixture, with a real
// signed-in learner finishing the required courses end-to-end.
test.describe("Phase 4 — certificate renders for a real completion (demo-path)", () => {
  test.skip(!hasLearnerAuth(), NO_AUTH_REASON);

  test.use({ storageState: LEARNER_STATE });

  test("cert page renders data-cert=issued after both required courses are complete", async ({
    page,
    request,
  }) => {
    // Enroll (idempotent server-side).
    const enrolled = await request.post("/api/enroll/path", {
      data: { pathSlug: "demo-path" },
    });
    expect(enrolled.status()).toBeLessThan(500);

    for (const cardId of [
      "demo-topic-basic-c1",
      "demo-topic-intermediate-c1",
    ]) {
      const res = await request.post("/api/progress", {
        data: { cardId, status: "completed", score: 1.0 },
      });
      expect(res.ok(), await res.text()).toBe(true);
    }

    const res = await page.goto(`/paths/demo-path/certificate`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('[data-cert="issued"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/certificate of completion/i)).toBeVisible();
  });
});
