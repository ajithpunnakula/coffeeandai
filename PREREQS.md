# Prerequisites — verified state and gaps

Verified just before generating PROMPT.md.

## ✅ Verified (no action needed)

- **gh CLI** logged in as `ajithpunnakula` with `repo`, `workflow`, `gist`, `read:org` scopes.
- **Vercel CLI** v48.6.0 logged in as `ajithpunnakula`. Project linked: `coffeeandai` (`prj_kQc5IykLuN5yuBZWzNNAfJi4vGm5`).
- **Vercel env vars** present for Development / Preview / Production: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `BLOB_READ_WRITE_TOKEN`, Clerk URL vars.
- **Vitest** configured (`web/vitest.config.ts`, jsdom env, alias `@/` → `web/src/`). Existing tests at `web/__tests__/`. CI runs `npx vitest run` on PRs (`.github/workflows/test.yml`).
- **Playwright** configured (`web/playwright.config.ts`, baseURL `https://coffeeandai.xyz`). Existing E2E in `web/e2e/`.
- **Repo state** clean on `main`. Recent commits follow imperative-style ("Fix X", "Add Y", "Stop Z").
- **Local `web/.env`** present (created Apr 18; assumed populated).

## ⚠️ Gaps the prompt instructs the agent to handle

1. **No vitest `test` npm script** — only `test:e2e` exists. Agent will use `npx vitest run` (matches CI). Optional: add `"test": "vitest run"` to `web/package.json` scripts.
2. **Clerk-backed E2E base wiring DONE** in PR #51 (merged 2026-05-01): `@clerk/testing` devDep, `web/playwright.global-setup.ts` calls `clerkSetup()`, `web/playwright.config.ts` wires `globalSetup` + a localhost-only `webServer`, and `web/e2e/clerk-testing-token.spec.ts` is a passing smoke spec. **Still TODO in Phase 1**: per-role `storageState` (`web/.auth/learner.json`, `web/.auth/author.json`), `scripts/seed-test-users.ts`, and `web/.auth/` in `.gitignore`.
3. **No Chrome DevTools MCP / Playwright MCP** is configured for this Claude Code installation (`claude mcp list` shows only `qmd` connected). The prompt avoids relying on either MCP and runs Playwright directly. If you want Playwright MCP, install with:
   ```
   claude mcp add playwright -- npx -y @executeautomation/playwright-mcp-server
   ```
   (Not required for the run.)
4. **Vercel project link lives at repo root, not in `web/`** — the agent should run `vercel` commands from the repo root, not the `web/` subdir.
5. **Existing `e2e/courses.spec.ts` will break** when `/courses` learner catalog moves to `/browse` in Phase 1. Phase 1 must update or replace it.

## ✅ Pre-Phase-1 cleanup completed (PRs #51 + #52, 2026-05-01)

- **Fixed `/sign-in` 500** — `<SignInButton><button>...</button></SignInButton>` rendered from an async server `NavBar` triggered `React.Children.only()` rejection under Next 16 + React 19 RSC. Moved into a `"use client"` wrapper at `web/src/components/SignInNavButton.tsx`. **Pattern to repeat** if Phase 1's role/route rename introduces new Clerk button usages (`SignInButton`/`SignUpButton`/`SignOutButton` with custom child JSX should live inside a client component).
- **Wired `@clerk/testing`** — `web/playwright.global-setup.ts` + a smoke spec at `web/e2e/clerk-testing-token.spec.ts`. Verified `clerkSetup()` against the dev instance (`relaxed-platypus-90.clerk.accounts.dev`) — testing tokens are implicitly enabled on `pk_test_` keys, no dashboard toggle needed.
- **Bumped `@clerk/nextjs`** `^7.2.2` → `^7.2.9`.
- **Excluded `e2e/**` from vitest** so Playwright specs aren't picked up by the unit-test runner.
- **Fixed 5 stale vitest tests**: `web/__tests__/components/PageCard.test.tsx` (3 tests for difficulty labels removed in commit `df8a3e5` UX redesign) and `web/__tests__/components/QuizCard.test.tsx` (color rename `green` → `emerald`; `onComplete` now fires on every completion regardless of pass/fail to feed `CardPlayer`'s mastery checkpoint).
- **Vitest baseline now green** when run from `web/`: `cd web && npx vitest run` → 22 files / 151 tests, 0 failed. Lint baseline unchanged (105 pre-existing errors); not introduced or addressed in this cleanup.

## 🔴 Things you (the user) should confirm before kicking off

Run these once before pasting the prompt:

```bash
# 1. Repo on main, clean tree
cd /Users/aj/code/coffeeandai && git status

# 2. Web deps installed
cd /Users/aj/code/coffeeandai/web && npm install

# 3. Playwright browsers installed (one-time)
cd /Users/aj/code/coffeeandai/web && npx playwright install chromium

# 4. Pull dev env to local for DB access during phase 1 schema migration
cd /Users/aj/code/coffeeandai && vercel env pull web/.env.development.local --environment=development

# 5. Confirm Clerk testing tokens work — VERIFIED 2026-05-01
#    Dev instance has testing tokens implicitly enabled (no dashboard toggle needed
#    for `pk_test_` keys). Confirmed by running clerkSetup() against
#    relaxed-platypus-90.clerk.accounts.dev and successfully fetching a token.
#    Wiring already in place: web/playwright.global-setup.ts + @clerk/testing devDep.
```

## Browser logins (your note)

You said:
- Regular user signed into chatgpt-atlas browser at coffeeandai.xyz
- Admin signed into Chrome at coffeeandai.xyz

The agent does NOT use those sessions — it uses Playwright headless Chromium with its own `storageState`. Your browser sessions are independent and won't be touched. They're useful for *manual* sanity checks while the agent runs but are not part of automation.

## What the agent will produce

- **Branches**: `phase-1-foundation`, `phase-2-levels`, `phase-3-paths`, `phase-4-polish`, `phase-5-practice`.
- **PRs**: 5 of them, each merged before the next starts.
- **Files at repo root**: `PLAN.md`, `PROMPT.md`, `PREREQS.md` (this file), `STATUS.md` (created during the run, append-only).
