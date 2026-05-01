/**
 * Ensure two Clerk test users exist for E2E auth flows, and mirror them in
 * learner.users with the right roles:
 *   - learner+clerk_test@coffeeandai.dev (role: learner)
 *   - author+clerk_test@coffeeandai.dev  (role: author)
 *
 * The `+clerk_test` suffix is a Clerk test-mode convention: those addresses
 * are auto-verified and never receive a real email. This is safe to run
 * against the project's test-mode Clerk app (sk_test_*).
 *
 * Required env:
 *   CLERK_SECRET_KEY        — sk_test_* (Clerk Backend API auth)
 *   DATABASE_URL            — Neon connection string
 *
 * Optional env:
 *   CLERK_TEST_USER_PASSWORD — password used for both users
 *                              (default: a project-local constant; only
 *                              meaningful against a test-mode Clerk app).
 *
 * Writes to stdout (KEY=VALUE per line — eval-friendly):
 *   CLERK_TEST_LEARNER_EMAIL=...
 *   CLERK_TEST_LEARNER_PASSWORD=...
 *   CLERK_TEST_LEARNER_ID=user_...
 *   CLERK_TEST_AUTHOR_EMAIL=...
 *   CLERK_TEST_AUTHOR_PASSWORD=...
 *   CLERK_TEST_AUTHOR_ID=user_...
 *
 * Usage:
 *   tsx scripts/seed-test-users.ts
 *
 *   # Or pipe straight into your shell to export the vars:
 *   eval "$(tsx scripts/seed-test-users.ts | sed 's/^/export /')"
 */
import { neon } from "@neondatabase/serverless";
import path from "node:path";

// Load env from web/.env.development.local (Vercel CLI-managed) so this
// script works without the caller having to export everything by hand.
// process.loadEnvFile is built into Node 21+ and supports the same .env
// format Vercel writes, including double-quoted `\n`-escaped values.
try {
  process.loadEnvFile(
    path.resolve(__dirname, "..", "web", ".env.development.local"),
  );
} catch {
  /* env file optional — fall back to whatever the caller exported */
}

const CLERK_API = "https://api.clerk.com/v1";
const LEARNER_EMAIL = "learner+clerk_test@coffeeandai.dev";
const AUTHOR_EMAIL = "author+clerk_test@coffeeandai.dev";

interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
}

function bearer(secret: string) {
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

async function findUserByEmail(
  secret: string,
  email: string,
): Promise<ClerkUser | null> {
  const res = await fetch(
    `${CLERK_API}/users?email_address=${encodeURIComponent(email)}`,
    { headers: bearer(secret) },
  );
  if (!res.ok) {
    throw new Error(
      `Clerk lookup failed for ${email}: ${res.status} ${await res.text()}`,
    );
  }
  const users = (await res.json()) as ClerkUser[];
  return users[0] ?? null;
}

async function createUser(
  secret: string,
  email: string,
  password: string,
  firstName: string,
): Promise<ClerkUser> {
  const res = await fetch(`${CLERK_API}/users`, {
    method: "POST",
    headers: bearer(secret),
    body: JSON.stringify({
      email_address: [email],
      password,
      first_name: firstName,
      skip_password_checks: true,
      skip_password_requirement: false,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Clerk createUser failed for ${email}: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as ClerkUser;
}

async function ensureUser(
  secret: string,
  email: string,
  password: string,
  firstName: string,
): Promise<string> {
  const existing = await findUserByEmail(secret, email);
  if (existing) return existing.id;
  const created = await createUser(secret, email, password, firstName);
  return created.id;
}

async function upsertLearnerRow(
  databaseUrl: string,
  clerkId: string,
  displayName: string,
  role: "learner" | "author",
) {
  const sql = neon(databaseUrl);
  await sql`
    INSERT INTO learner.users (clerk_id, display_name, role)
    VALUES (${clerkId}, ${displayName}, ${role})
    ON CONFLICT (clerk_id) DO UPDATE SET role = EXCLUDED.role, display_name = EXCLUDED.display_name
  `;
}

async function main() {
  const secret = (process.env.CLERK_SECRET_KEY ?? "").trim();
  const databaseUrl = (process.env.DATABASE_URL ?? "").trim();
  const password =
    (process.env.CLERK_TEST_USER_PASSWORD ?? "Pa55w0rd-coffee-test").trim();

  if (!secret) {
    console.error("CLERK_SECRET_KEY not set");
    process.exit(1);
  }
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const learnerId = await ensureUser(
    secret,
    LEARNER_EMAIL,
    password,
    "Test Learner",
  );
  await upsertLearnerRow(databaseUrl, learnerId, "Test Learner", "learner");

  const authorId = await ensureUser(
    secret,
    AUTHOR_EMAIL,
    password,
    "Test Author",
  );
  await upsertLearnerRow(databaseUrl, authorId, "Test Author", "author");

  process.stdout.write(`CLERK_TEST_LEARNER_EMAIL=${LEARNER_EMAIL}\n`);
  process.stdout.write(`CLERK_TEST_LEARNER_PASSWORD=${password}\n`);
  process.stdout.write(`CLERK_TEST_LEARNER_ID=${learnerId}\n`);
  process.stdout.write(`CLERK_TEST_AUTHOR_EMAIL=${AUTHOR_EMAIL}\n`);
  process.stdout.write(`CLERK_TEST_AUTHOR_PASSWORD=${password}\n`);
  process.stdout.write(`CLERK_TEST_AUTHOR_ID=${authorId}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
