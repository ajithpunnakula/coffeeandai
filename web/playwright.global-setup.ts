import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { chromium } from "@playwright/test";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = path.resolve(__dirname, ".auth");
export const LEARNER_STATE = path.join(AUTH_DIR, "learner.json");
export const AUTHOR_STATE = path.join(AUTH_DIR, "author.json");

async function saveStorageState(opts: {
  baseURL: string;
  email: string;
  outFile: string;
}) {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ baseURL: opts.baseURL });
    const page = await context.newPage();

    // `clerk.signIn` requires Clerk to be mounted on the current page. /browse
    // is public and renders Clerk header components, so it loads window.Clerk.
    await page.goto("/browse");
    await clerk.loaded({ page });

    // Email-based ticket sign-in. Clerk's testing helper creates a sign-in
    // token via the Backend API and uses the ticket strategy — works even
    // when the Clerk app's only first-factor is email_code (i.e., password
    // strategy isn't allowed). Requires CLERK_SECRET_KEY in env.
    await clerk.signIn({
      page,
      emailAddress: opts.email,
    });

    // Land on a public-but-authed page so the session cookie is fully written
    // before we serialize storageState.
    await page.goto("/browse");
    await page.waitForLoadState("networkidle").catch(() => {});

    await context.storageState({ path: opts.outFile });
  } finally {
    await browser.close();
  }
}

async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, ".env.development.local") });
  dotenv.config({ path: path.resolve(__dirname, ".env.local") });
  dotenv.config({ path: path.resolve(__dirname, ".env") });

  await clerkSetup();

  const learnerEmail = process.env.CLERK_TEST_LEARNER_EMAIL;
  const authorEmail = process.env.CLERK_TEST_AUTHOR_EMAIL;

  if (!learnerEmail && !authorEmail) {
    // Public-only run. Authed specs will self-skip via fs.existsSync checks.
    return;
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "https://coffeeandai.xyz";

  if (learnerEmail) {
    await saveStorageState({
      baseURL,
      email: learnerEmail,
      outFile: LEARNER_STATE,
    });
  }
  if (authorEmail) {
    await saveStorageState({
      baseURL,
      email: authorEmail,
      outFile: AUTHOR_STATE,
    });
  }
}

export default globalSetup;
