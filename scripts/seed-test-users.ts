/**
 * Seed test users in learner.users for E2E auth flows.
 *
 * Reads CLERK_TEST_LEARNER_ID and CLERK_TEST_AUTHOR_ID from the environment
 * (set them to the Clerk user IDs you intend to sign in as in Playwright)
 * and upserts matching rows in learner.users so role guards resolve.
 *
 * Run: tsx scripts/seed-test-users.ts
 */
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const learnerId = process.env.CLERK_TEST_LEARNER_ID;
  const authorId = process.env.CLERK_TEST_AUTHOR_ID;
  if (!learnerId || !authorId) {
    console.error(
      "Set CLERK_TEST_LEARNER_ID and CLERK_TEST_AUTHOR_ID to the Clerk IDs of your test users.",
    );
    process.exit(1);
  }

  const sql = neon(url);

  await sql`
    INSERT INTO learner.users (clerk_id, display_name, role)
    VALUES (${learnerId}, 'Test Learner', 'learner')
    ON CONFLICT (clerk_id) DO UPDATE SET role = 'learner'
  `;

  await sql`
    INSERT INTO learner.users (clerk_id, display_name, role)
    VALUES (${authorId}, 'Test Author', 'author')
    ON CONFLICT (clerk_id) DO UPDATE SET role = 'author'
  `;

  console.log("Seeded test users for learner + author roles.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
