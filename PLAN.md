# coffeeandai — POC Plan: Learning Paths, Difficulty Levels, Adaptive Practice

Single source of truth for the next major iteration. POC freedom: schema and routes can be reset; no migration concerns.

---

## 1. Decisions (locked)

| Decision | Choice |
|---|---|
| Term for ordered course set | **Learning Path** (DB: `learning_paths`, UI: "Path" / "Learning Path") |
| Author-role rename | **Author** (replaces `developer`) |
| Workspace name | **Studio** (replaces `/developer`) |
| Path → course relationship | Many-to-many; one course can live in multiple paths |
| Path completion | Strict — all `required=true` courses complete |
| Prerequisites | Linear with completion gating; per-course `required` flag |
| Level variants | Basic / Intermediate / Advanced; "Generate all three" allowed (3× LLM cost OK) |
| Authoring permissions | Authors and Admins only; learners consume |
| Catalog default tab | Paths |
| Practice rounds | Ephemeral, session-only, never persisted to DB |
| Practice round size | Variable 3–5 (LLM picks based on miss complexity) |
| Practice trigger | Opt-out by default; "don't ask again this session" escape hatch |

---

## 2. Roles & permissions

- **Learner** — browse, enroll, take courses/paths, view own progress.
- **Author** — everything Learner does + create/edit courses & paths via Studio.
- **Admin** — everything Author does + manage users/roles + view org-wide insights.

Stored in `learner.users.role`: `learner | author | admin`. The existing `developer` role is renamed to `author` (and migrated where rows exist).

---

## 3. Data model (clean slate)

### content schema

```
courses
  id, slug, title, summary,
  topic_key TEXT,                       -- groups level variants of one topic
  level TEXT,                           -- basic | intermediate | advanced | null
  domains JSONB, status, pass_threshold,
  estimated_minutes, card_order TEXT[],
  created_at, published_at

cards                                   -- unchanged
  id, course_id, card_type, ord,
  difficulty INT (0-3), domain, content JSONB

learning_paths
  id, slug, title, summary,
  audience TEXT, level TEXT (optional),
  tags JSONB, status,
  estimated_minutes, created_at, published_at

learning_path_courses                   -- ordered M:N
  path_id, course_id,
  position INT,
  required BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (path_id, course_id)

course_drafts, card_drafts,
learning_path_drafts,
learning_path_courses_draft             -- mirror drafts pattern
```

### learner schema

```
users.role                              -- 'learner' | 'author' | 'admin'
enrollments                             -- per-course
path_enrollments                        -- new: user_id, path_id, started_at, completed_at
card_progress                           -- unchanged
```

### Practice rounds — no schema

Pure client state + `sessionStorage`. Optional Axiom telemetry events only (`practice_round_started`, `practice_round_completed`, `triggered_by`). No DB writes, no `card_progress` side effects.

---

## 4. Routes

```
PUBLIC / LEARNER
/                              → landing or auto-redirect to /browse if signed in
/browse                        → catalog, tabs: Paths (default) | Courses
/paths/[slug]                  → path detail + gating
/courses/[slug]                → course detail
/courses/[slug]/play           → card player
/learn                         → My Learning (in-progress paths + courses)

AUTHOR (Studio)
/studio                        → dashboard (drafts, recent activity)
/studio/courses                → list + filters
/studio/courses/new            → generate course (level selector here)
/studio/courses/[slug]/edit    → CourseEditor
/studio/paths                  → list
/studio/paths/new              → blank path builder
/studio/paths/[slug]/edit      → path builder

ADMIN
/admin/people                  → users + role assignment
/admin/insights                → enrollment / completion / drop-off

API
/api/studio/courses/generate   → existing generator, accepts level + topic_key
/api/studio/paths/*            → CRUD for paths + path-courses
/api/practice/generate         → ephemeral practice questions (Phase 5)
```

Old `/developer` and current `/courses` catalog get replaced. No redirects (POC).

---

## 5. UX flows

### 5.1 Generate Course — `/studio/courses/new`

Streaming form:
- **Topic** (free text)
- **Level** — Basic / Intermediate / Advanced / **All three**
- **Audience** (optional)
- **Domains** (optional)

"All three" fans out into 3 parallel streamed generations; slugs auto-suffix (`kubernetes-basic`, `kubernetes-intermediate`, `kubernetes-advanced`); all three share one `topic_key`.

Generator (`web/src/lib/course-generator.ts`):
- `planCourse({ topic, level, audience })`.
- `level` shapes assumed prerequisites, target Bloom level, card-mix difficulty weighting (basic 0–1, intermediate 1–2, advanced 2–3), example complexity.
- Persists `level` + `topic_key` on draft.

### 5.2 Path Builder — `/studio/paths/[slug]/edit`

Three-pane:
- **Left** — searchable course library (filter by level/tag/status). Drag courses into path.
- **Center** — vertical drag-reorder list. Each row: title, level badge, est. minutes, **Required** toggle, remove. Auto-summed total time at top.
- **Right** — metadata (title, slug, summary, audience, tags, level, status).

Top bar: Save (auto), Publish, Preview-as-learner. v1 strictly linear gating; DAG branching deferred.

### 5.3 Catalog — `/browse`

- Tabs: **Paths** (default) | **Courses**.
- Topics with multiple levels render as one tile with level pills (Basic · Intermediate · Advanced).
- Path tile: title, # courses, est. minutes, audience, level mix.

### 5.4 Path Detail — `/paths/[slug]`

- Header: title, audience, total time, # courses, enroll/continue CTA.
- Body: course list with progress per course. Locked icon on courses behind an unfinished `required` course.
- Sidebar: progress ring (% required complete), est. time remaining.

### 5.5 My Learning — `/learn`

- **Paths in progress** — tiles with progress rings.
- **Courses in progress** — including standalone enrollments.
- Completed section collapses below.

### 5.6 Adaptive Practice Round (Phase 5; ephemeral)

**Triggers (per session, per domain):**
- Hard: 3 consecutive wrong answers in same domain.
- Soft: <50% accuracy over last 5 quiz/scenario cards in same domain.
- Manual: "I'm struggling, extra practice" button on quiz cards.

**Flow:**
1. Trigger fires → inline interstitial: *"This topic is tricky — want a 3-question practice round? It won't affect your progress."* (Yes / No / Don't ask again this session.)
2. Modal opens with "Practice Round · won't be saved" badge.
3. For each generated question: submit → immediately show explanation for **every** option (correct or not).
4. End screen: "You got X/Y. Ready to keep going?" → returns to the exact card they were on.
5. Tab close / session end → practice content gone.

**Generation (`/api/practice/generate`):**
- Inputs: missed concepts (card title, correct answer, learner pick), domain, level, last 1–2 wrong-answer contexts.
- Output: 3–5 questions, each choice carrying its own `explanation` string.
- Streams; first question visible <1s.

**Storage:** React state + `sessionStorage` mirror. No DB. Optional Axiom events for threshold tuning.

---

## 6. Phasing (with acceptance criteria)

Each phase ships as its own branch + PR + merge + live-URL verification before the next phase begins.

### Phase 1 — Foundation: schema + rename

**Scope**
- Drop & recreate schema with new shape (POC; no migration).
- Rename role `developer` → `author` everywhere (DB enum/check, auth guards, types, route segments).
- Move routes: `/developer/*` → `/studio/*`, learner `/courses` catalog → `/browse` (course detail keeps `/courses/[slug]`).
- Add `level` and `topic_key` columns to `content.courses` + `content.course_drafts` (plumbing only — no UI yet, no generator changes yet).
- Add `learning_paths`, `learning_path_courses`, drafts mirror, `learner.path_enrollments` tables (empty; not yet wired).

**Acceptance**
- `npx vitest run` green.
- `npm run lint` clean.
- `npx playwright test` green against dev server (e2e/courses.spec.ts updated to hit `/browse`).
- Existing course generation still works end-to-end on the deployed preview URL.
- `requireAuthor()` guard exists; old `requireDeveloper()` removed.
- Live verification on production URL: signing in as an author lands on `/studio` (not `/developer`); generating a course still works.

### Phase 2 — Difficulty Levels

**Scope**
- `planCourse()` accepts `level`; prompt updates per level (basic/intermediate/advanced specifics).
- `/studio/courses/new` form with Level radio + "All three" fanout (3 parallel streamed generations).
- Slug auto-suffix when level is set; `topic_key` written.
- `/browse` groups by `topic_key`, shows level pills, links to per-level course.

**Acceptance**
- Vitest covers: prompt-builder accepts level; "all three" fanout produces 3 drafts with shared `topic_key` and distinct slugs/levels.
- Playwright covers: catalog renders a topic-tile with three level pills when 3 levels exist; clicking a pill goes to the matching course.
- Live verification: generate "Kubernetes" with "All three" in production; observe 3 drafts; publish all three; confirm catalog grouping.

### Phase 3 — Learning Paths

**Scope**
- Path CRUD APIs (`/api/studio/paths/*`).
- `/studio/paths` list + `/studio/paths/new` + `/studio/paths/[slug]/edit` (three-pane builder, drag-reorder, Required toggle).
- `/paths/[slug]` learner detail with linear gating.
- `path_enrollments` writes; My Learning surfaces paths-in-progress.
- `/browse` Paths tab populated.

**Acceptance**
- Vitest: path CRUD round-trip; gating logic (locked/unlocked) per `required` flag; path completion = all required complete.
- Playwright: author creates a 3-course path, publishes it; learner enrolls, second course is locked until first is complete; on completion of required courses, path shows complete.
- Live verification: above flow on production URL, end-to-end as both an author and a learner account.

### Phase 4 — Polish

**Scope**
- Path-level certificate / completion artifact (simple shareable page is enough).
- Pre-assessment routing learner to a level (5-question quick check on topic-tile click).
- LLM-generated path proposals (`/studio/paths/new` → "Generate from topic + audience" — proposes 3–6 course titles + levels + ordering).
- Admin Insights upgrade: drop-off heatmap per course, path funnel.

**Acceptance**
- Vitest: pre-assessment scoring → recommended level mapping is deterministic.
- Playwright: certificate page renders for completed path; admin insights page loads with at least empty-state UI.
- Live verification: end-to-end pre-assessment → enrollment in recommended level on production.

### Phase 5 — Adaptive Practice Rounds

**Scope**
- `/api/practice/generate` route + `practice-generator.ts` prompt.
- `usePracticeTrigger` hook with hard/soft/manual triggers.
- `PracticeRoundModal` component, sessionStorage-backed state, no DB writes.
- Axiom telemetry events.
- Manual "extra practice" button on quiz/scenario cards always available.

**Acceptance**
- Vitest: trigger thresholds (3-in-a-row, <50% over 5); session reset on tab close; `card_progress` is NOT written during a practice round.
- Playwright: simulate misses → assert interstitial appears → accept → assert modal opens with practice content → answer all → assert return to original card.
- Live verification: deliberately fail 3 quiz cards on production; observe interstitial; complete practice round; confirm no DB rows written.

---

## 7. Testing & workflow conventions

### Test pyramid
- **Vitest unit / integration** (`web/__tests__/`) — covers schemas, server logic, components with mocked Clerk + DB. Fast, run on every change.
- **Playwright E2E** (`web/e2e/`) — covers critical user paths against a running app (dev server in CI, production URL for post-deploy verification).
- **Live verification** — after Vercel deploys, run Playwright against `PLAYWRIGHT_BASE_URL=https://coffeeandai.xyz` to verify the deployed build.

### Auth in E2E
- Use `@clerk/testing` package with `setupClerkTestingToken({ page })` and Playwright `storageState` to persist a signed-in session per role.
- Two storage states needed: `learner.json`, `author.json` (admin reuses author for now). Generated by a Playwright global-setup script that signs in via Clerk's testing token flow.
- Test users created in DB via a one-shot seed script (`scripts/seed-test-users.ts`) keyed off Clerk test tokens.

### Per-phase TDD loop
1. `git checkout -b phase-N-<short-name>` off latest `main`.
2. **Red** — write failing tests describing the acceptance criteria for the phase. Commit.
3. **Green** — implement until tests pass. Run `npx vitest run` + `npm run lint` + `npx playwright test`. Commit incrementally.
4. **Refactor** — clean up while keeping green.
5. `git push -u origin <branch>`; `gh pr create` with summary + test plan checklist.
6. Wait for GitHub Actions CI to pass.
7. `gh pr merge --merge`.
8. Wait for Vercel auto-deploy to production (poll `vercel inspect` or list deployments).
9. Run `PLAYWRIGHT_BASE_URL=https://coffeeandai.xyz npx playwright test e2e/<phase>.spec.ts` to verify live.
10. Only then start the next phase.

### Commit / PR style
- Commit messages: imperative ("Add level field to course drafts"), match the repo's existing style.
- Branch naming: `phase-1-foundation`, `phase-2-levels`, `phase-3-paths`, `phase-4-polish`, `phase-5-practice`.
- PR title format: `[Phase N] Short description`.
- PR body must include: scope summary, acceptance-criteria checklist, link to this PLAN.md.
- Never push to main directly. Never `--no-verify`.

---

## 8. Risks / known gaps to handle in the prompt

- **Next.js 16 has breaking changes** vs. older training data. `web/AGENTS.md` requires reading `node_modules/next/dist/docs/` before touching framework-level code.
- **Clerk-backed E2E base wiring is in place** (PR #51, merged 2026-05-01): `@clerk/testing` is a devDep, `web/playwright.global-setup.ts` calls `clerkSetup()` and is wired into `web/playwright.config.ts`, and a smoke spec at `web/e2e/clerk-testing-token.spec.ts` verifies bot-protection bypass. Phase 1 still needs to add per-role `storageState` (`web/.auth/learner.json`, `web/.auth/author.json`) plus `scripts/seed-test-users.ts` and `web/.auth/` to `.gitignore`.
- **RSC + Clerk button gotcha** (also fixed in PR #51): rendering `<SignInButton><button>...</button></SignInButton>` directly from an async server component triggers `React.Children.only()` to reject the children under Next 16 + React 19, returning a 500. Pattern: wrap the Clerk button + its custom child in a `"use client"` component (see `web/src/components/SignInNavButton.tsx`). Apply the same pattern if the rename introduces new usages of `SignInButton`/`SignUpButton`/`SignOutButton`.
- **Existing `/courses` catalog → `/browse` rename** affects an existing Playwright spec (`e2e/courses.spec.ts`) — update or replace as part of Phase 1.
- **AGENTS.md** at `web/AGENTS.md` and `web/CLAUDE.md` (which @-references AGENTS.md) is authoritative — read on every phase start.
- **3× LLM generation cost** is approved, but prompt should still budget reasonable max-tokens to avoid runaway spend.
- **No Chrome DevTools MCP / Playwright MCP** is currently configured in this Claude Code installation. Use Playwright scripts directly (already installed in `web/`).
- **Draft data may exist** under the old schema. POC freedom permits dropping it; do not preserve.
- **Run vitest from `web/`** — `npx vitest run` (matching CI's `working-directory: web`). Running from repo root surfaces unrelated nested test files and false failures. Vitest config now excludes `e2e/**` so Playwright specs aren't picked up.
