import fs from "node:fs";
import path from "node:path";

export const LEARNER_STATE = path.resolve(__dirname, "../../.auth/learner.json");
export const AUTHOR_STATE = path.resolve(__dirname, "../../.auth/author.json");

export function hasLearnerAuth(): boolean {
  return fs.existsSync(LEARNER_STATE);
}

export function hasAuthorAuth(): boolean {
  return fs.existsSync(AUTHOR_STATE);
}

export function hasBothAuth(): boolean {
  return hasLearnerAuth() && hasAuthorAuth();
}

export const NO_AUTH_REASON =
  "Per-role storageState not generated. Run `tsx scripts/ensure-clerk-test-users.ts`, " +
  "export CLERK_TEST_LEARNER_EMAIL/PASSWORD + CLERK_TEST_AUTHOR_EMAIL/PASSWORD, " +
  "then re-run Playwright.";
