import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
import {
  AUTHOR_STATE,
  LEARNER_STATE,
  hasBothAuth,
  NO_AUTH_REASON,
} from "./_helpers/auth";

// Author-creates-then-learner-completes — runs only when per-role storage
// state is generated (see playwright.global-setup.ts + scripts/seed-test-users.ts).
test.describe("Phase 3 — author creates path, learner completes, cert renders", () => {
  test.skip(!hasBothAuth(), NO_AUTH_REASON);

  const SLUG = "e2e-authed-path";
  const TITLE = "E2E Authed Path";

  test.beforeAll(async () => {
    // Reset any leftover state from a previous run so the test is idempotent.
    if (!process.env.DATABASE_URL) return;
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      DELETE FROM learner.path_enrollments
      WHERE path_id IN (SELECT id FROM content.learning_paths WHERE slug = ${SLUG})
    `;
    await sql`DELETE FROM content.learning_paths WHERE slug = ${SLUG}`;
    await sql`
      DELETE FROM content.learning_path_courses_draft
      WHERE path_id IN (SELECT id FROM content.learning_path_drafts WHERE slug = ${SLUG})
    `;
    await sql`DELETE FROM content.learning_path_drafts WHERE slug = ${SLUG}`;
  });

  test.afterAll(async () => {
    if (!process.env.DATABASE_URL) return;
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      DELETE FROM learner.path_enrollments
      WHERE path_id IN (SELECT id FROM content.learning_paths WHERE slug = ${SLUG})
    `;
    await sql`DELETE FROM content.learning_paths WHERE slug = ${SLUG}`;
    await sql`
      DELETE FROM content.learning_path_courses_draft
      WHERE path_id IN (SELECT id FROM content.learning_path_drafts WHERE slug = ${SLUG})
    `;
    await sql`DELETE FROM content.learning_path_drafts WHERE slug = ${SLUG}`;
  });

  test("end-to-end: author drafts → publishes → learner enrolls → completes → cert", async ({
    browser,
  }) => {
    // ---- Author side ----
    const authorCtx = await browser.newContext({ storageState: AUTHOR_STATE });
    const authorReq = authorCtx.request;

    const created = await authorReq.post("/api/studio/paths", {
      data: { title: TITLE, slug: SLUG, summary: "E2E test path" },
    });
    expect(created.ok(), await created.text()).toBe(true);

    const patched = await authorReq.patch(`/api/studio/paths/${SLUG}`, {
      data: {
        courses: [
          { course_slug: "demo-topic-basic", required: true },
          { course_slug: "demo-topic-intermediate", required: true },
        ],
      },
    });
    expect(patched.ok(), await patched.text()).toBe(true);

    const published = await authorReq.post(`/api/studio/paths/${SLUG}/publish`);
    const publishedBody = await published.text();
    expect(
      published.ok(),
      `publish status=${published.status()} body=${publishedBody}`,
    ).toBe(true);
    expect(publishedBody, "publish body").toContain('"ok":true');
    await authorCtx.close();

    // Sanity-check DB state directly: publish endpoint claimed ok, the row
    // had better exist as 'published' before the learner side runs.
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      const pathRows = await sql`
        SELECT slug, status FROM content.learning_paths WHERE slug = ${SLUG}
      `;
      expect(pathRows.length, JSON.stringify(pathRows)).toBe(1);
      expect(pathRows[0].status).toBe("published");
    }

    // ---- Learner side ----
    const learnerCtx = await browser.newContext({ storageState: LEARNER_STATE });
    const learnerReq = learnerCtx.request;

    const enrolled = await learnerReq.post("/api/enroll/path", {
      data: { pathSlug: SLUG },
    });
    expect(enrolled.ok(), await enrolled.text()).toBe(true);

    // demo-topic fixtures have one card each; mark both required courses
    // complete so isPathComplete() resolves true.
    for (const cardId of [
      "demo-topic-basic-c1",
      "demo-topic-intermediate-c1",
    ]) {
      const progressRes = await learnerReq.post("/api/progress", {
        data: { cardId, status: "completed", score: 1.0 },
      });
      expect(progressRes.ok(), await progressRes.text()).toBe(true);
    }

    const learnerPage = await learnerCtx.newPage();
    const res = await learnerPage.goto(`/paths/${SLUG}/certificate`);
    expect(res?.status()).toBe(200);
    // data-cert="issued" only renders when isPathComplete() is true *and*
    // preview mode is off — i.e., the real-completion path.
    await expect(learnerPage.locator('[data-cert="issued"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      learnerPage.getByText(/certificate of completion/i),
    ).toBeVisible();
    await learnerCtx.close();
  });
});
