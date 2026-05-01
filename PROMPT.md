# Kickoff prompt — autonomous execution of PLAN.md

Paste the section below into a fresh Claude Code session at the repo root (`/Users/aj/code/coffeeandai`). Before you do, confirm the prerequisites listed in PREREQS.md.

---

## PROMPT

Read `/Users/aj/code/coffeeandai/PLAN.md` end-to-end before doing anything else. Then read `/Users/aj/code/coffeeandai/web/AGENTS.md` and `/Users/aj/code/coffeeandai/CLAUDE.md`. The plan is the contract — implement it phase by phase. **Do not deviate from the locked decisions in §1.** If you discover a blocker that requires deviation, stop and surface it before proceeding.

You are operating autonomously. The user is not available to answer questions. Use your best judgment within the plan; when truly stuck, leave a clear stopped-for-input report at the top of `STATUS.md` at repo root and stop the run rather than hacking around it.

### Working agreement

1. **TDD is mandatory.** For every phase: write failing tests first that encode the §6 acceptance criteria, commit them, then implement until green. Run `npx vitest run`, `npm run lint`, and `npx playwright test` before opening a PR.
2. **One phase = one branch = one PR = one merge = one live verification.** Phases run strictly in order: 1 → 2 → 3 → 4 → 5. Do not start phase N+1 until phase N is merged and verified live.
3. **Never push to main directly.** Use `gh pr create` and `gh pr merge --merge`. Never `--no-verify` or skip hooks.
4. **Match the repo's commit/PR style** (see `git log --oneline -20`).
5. **Track progress with TaskCreate / TaskUpdate.** Create one task per phase up front; create sub-tasks per phase as you start it.
6. **Read `web/AGENTS.md` at the start of every phase** — Next.js 16 has breaking changes vs. training data; consult `node_modules/next/dist/docs/` before any framework-level code.
7. **Update `STATUS.md` at repo root after every phase merges live.** One section per phase: branch name, PR URL, deploy URL, verification result, anything notable.

### Per-phase loop (apply to each of the 5 phases)

```
1. git checkout main && git pull
2. git checkout -b phase-N-<short-name>
3. Read PLAN.md §6 for this phase. Re-read AGENTS.md.
4. Create TaskCreate items for this phase.
5. RED:   write failing tests covering the §6 acceptance criteria for this phase.
          commit: "Phase N: failing tests for <scope>"
6. GREEN: implement until vitest + lint + playwright (local) all pass.
          commit incrementally with focused messages.
7. REFACTOR: clean up while staying green.
8. git push -u origin phase-N-<short-name>
9. gh pr create  (title: "[Phase N] <description>"; body: scope + acceptance checklist + link to PLAN.md)
10. Poll CI: `gh pr checks --watch`. If CI fails, fix and push.
11. gh pr merge --merge --delete-branch
12. Wait for Vercel auto-deploy:
       Use `vercel ls coffeeandai --token "$(cat ~/.vercel/auth.json | jq -r .token 2>/dev/null)"`
       OR poll `vercel inspect` on the latest deployment until READY.
13. Live verify against production:
       PLAYWRIGHT_BASE_URL=https://coffeeandai.xyz npx playwright test e2e/phase-N-*.spec.ts
14. Append a section to STATUS.md with the result.
15. If any step failed and you cannot resolve it cleanly, write the failure to STATUS.md and STOP. Do not start the next phase.
```

### Auth / test-user setup (do this once during Phase 1, before any authed E2E)

- Add `@clerk/testing` to `web/devDependencies` and follow the Playwright integration guide (`https://clerk.com/docs/testing/playwright/overview`).
- Create `web/playwright.global-setup.ts` that:
  - Calls `clerkSetup()`.
  - Signs in two test users (one `learner`, one `author`) using Clerk testing tokens.
  - Saves their `storageState` to `web/.auth/learner.json` and `web/.auth/author.json` (gitignored).
- Create `scripts/seed-test-users.ts` that upserts the matching rows into `learner.users` keyed off the Clerk IDs of the test users (so role guards resolve correctly).
- Add `web/.auth/` to `.gitignore`.
- Add Clerk testing keys to local `.env` (instruct user via STATUS.md if they're missing — do NOT commit secrets).

If Clerk testing tokens turn out to be unavailable in this Clerk instance, fall back to: tests against public surfaces only via Playwright; authed flows covered by Vitest integration tests with mocked Clerk (the existing pattern in `web/__tests__/auth-guards.test.ts`). Note this fallback in STATUS.md.

### Database strategy

- POC freedom: drop and recreate. The schema lives in `db/schema.sql`. Update it in Phase 1 to match PLAN.md §3 exactly.
- Apply schema changes via `psql "$DATABASE_URL" -f db/schema.sql` against the **Development** Vercel branch DB. Pull credentials with `vercel env pull web/.env.development.local --environment=development`.
- For Preview/Production schema rollout: include a one-shot SQL migration step in the PR body (the user will run it post-merge if needed). Verify by re-running schema queries via vitest integration tests.

### LLM cost discipline

- "Generate all three" is approved but cap each plan at ~30 cards and each card generation at sensible max_tokens. Match what `web/src/lib/course-generator.ts` already does — do not loosen limits.
- For Phase 5 practice generation: 3–5 questions per round, single LLM call, no streaming retries.

### What to do when blocked

- Don't hack around fundamental issues (auth not working, DB unreachable, CI broken on main, Vercel deploy failing repeatedly).
- Append a clear "BLOCKED — needs human" section to STATUS.md with: phase, what failed, what you tried, what you think the user should check.
- Stop the run.

### Definition of done for the whole run

- All 5 phase PRs merged and live-verified.
- STATUS.md has 5 green sections plus a final "All phases complete" summary.
- `npx vitest run` and `npx playwright test` against production are both green.
- No new lint warnings introduced.

Begin with Phase 1 now.
