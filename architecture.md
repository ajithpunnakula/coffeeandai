# Architecture

## System Overview

```
                     +-----------+
                     |  Sources  |
                     | (raw/*.md)|
                     +-----+-----+
                           |
                     ingest / wikify
                           |
                     +-----v-----+
                     |   Wiki    |
                     | (wiki/*)  |
                     +-----+-----+
                           |
                   generate-course
                           |
                +----------v----------+
                |   Course Content    |
                | (courses/*/cards/*) |
                +----------+----------+
                           |
                   publish-content.ts
                           |
            +--------------v--------------+
            |     PostgreSQL (Neon)       |
            |  content  | draft | learner |
            +--------------+--------------+
                           |
                  +--------v--------+
                  |  Next.js Web App |
                  |  (web/src/app)   |
                  +--------+--------+
                           |
       +--------+------+-------+--------+---------+
       |        |      |       |        |         |
   Player   Tutor  Practice  Gamify  Developer  Admin
```

## Directory Structure

```
coffeeandai/
├── raw/                  # Immutable source documents (articles, docs, guides)
├── wiki/                 # LLM-generated knowledge base (summaries, entities, concepts)
├── courses/              # Generated course content
│   └── claude-architect/ # Course manifest, cards, prerequisite graph, eval report
├── web/                  # Next.js application
│   └── src/
│       ├── app/          # Pages, API routes, layouts
│       ├── components/   # Card players, tutor, developer editors, gamification UI
│       └── lib/          # Database, profiler, adaptive router, gamification, auth
├── db/                   # PostgreSQL schema (content + draft + learner schemas)
├── scripts/              # Publishing, validation, evaluation, audio/media generation
├── fetch/                # Source ingestion pipeline (bash parsers + BATS tests)
├── .claude/skills/       # Claude Code skills powering the workflows
└── .github/workflows/    # CI: test on PR, auto-publish on merge
```

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Framework      | Next.js 16 (App Router, React 19)                |
| Styling        | Tailwind CSS 4, Framer Motion                    |
| Database       | PostgreSQL via Neon Serverless, Drizzle ORM       |
| Auth           | Clerk (OAuth, role-based access)                  |
| AI             | Claude API (tutor, generation), Vercel AI SDK     |
| Media          | OpenAI TTS, GPT Image 1, Vercel Blob storage     |
| Monitoring     | Sentry (errors), Axiom (logs), Vercel Analytics   |
| Testing        | Vitest (unit), Playwright (E2E), BATS (ingestion) |
| CI/CD          | GitHub Actions, Vercel                            |

## Data Pipeline

### 1. Source Ingestion

Raw sources (articles, PDFs, Google Docs, web pages, videos) are downloaded into `raw/` and never modified. The `fetch/` pipeline handles format detection and conversion:

- `ingest.sh` routes sources to the appropriate parser
- `parsers/web.sh` — HTML via Readability algorithm
- `parsers/pdf.sh` — PDF text extraction
- `parsers/gdoc.sh` — Google Docs via Drive API
- `parsers/video.sh` — Audio/video via Whisper transcription

The pipeline has integration tests using the BATS framework.

### 2. Wiki

The `/wikify` skill processes raw sources into structured wiki pages with YAML frontmatter and `[[wikilinks]]` for cross-referencing. Four page types:

- **Source summaries** — Key claims and arguments from each source
- **Entity pages** — People, orgs, tools, benchmarks that appear across sources
- **Concept pages** — Ideas, techniques, and patterns discussed across sources
- **Analyses** — Comparisons and synthesis generated from queries

`wiki/index.md` catalogs every page. `wiki/log.md` records all operations.

### 3. Course Generation

The `/generate-course` skill reads wiki pages and produces:

- **course.md** — Manifest defining domains, card order, and pass threshold
- **graph.yaml** — Concept prerequisite DAG
- **cards/*.md** — Individual cards (page, quiz, scenario, reflection types)

### 4. Quality Evaluation

`scripts/evaluate-cards.ts` runs an LLM-as-judge pipeline scoring each card on clarity, accuracy, alignment, and conciseness. Results feed into `content.card_quality`. `scripts/regenerate-weak-cards.ts` flags low-scoring cards for regeneration.

### 5. Publishing

`scripts/publish-content.ts` reads course files, computes content hashes, and upserts to PostgreSQL only when content has changed. Multiple runs are safe (idempotent). This also runs automatically via GitHub Actions when course files change on main.

## Database Design

Three areas within the database:

**`content.*`** (written by CI/publishing scripts, read-only for the app)
- `courses` — Metadata, domains, card ordering, pass threshold
- `cards` — Card content, type, difficulty, media URLs
- `graphs` — Concept prerequisites
- `card_metrics` / `domain_metrics` — Analytics aggregates
- `card_quality` — LLM eval scores (clarity, accuracy, alignment, conciseness) + human metrics + combined score

**Draft tables** (written by developer UI)
- `course_drafts` — Unpublished course edits
- `card_drafts` — Unpublished card edits
- `graph_drafts` — Unpublished graph edits
- `course_versions` — Published version snapshots with checksums
- `card_versions` — Card version snapshots
- `edit_history` — All manual edits + AI accepts/rejects (audit trail)

**`learner.*`** (written by the app)
- `users` — Synced from Clerk, includes total XP, streak tracking, badges, role
- `enrollments` — Course enrollments
- `card_progress` — Per-card completion status and scores
- `card_events` — Interaction events (attempt, skip, flag)
- `completions` — Final scores, domain breakdowns, certificate hashes
- `interactions` — Tutor conversation history
- `profiles` — Aggregated learner strengths and weaknesses
- `xp_events` — Append-only XP ledger (audit trail)
- `activity_days` — One row per user per active day (streak calculation)

## Web Application

### Pages

| Route                        | Purpose                              |
|------------------------------|--------------------------------------|
| `/courses`                   | Course catalog                       |
| `/courses/[slug]`            | Course detail with enrollment        |
| `/courses/[slug]/play`       | Card-by-card player                  |
| `/courses/[slug]/practice`   | Practice mode (AI-generated questions)|
| `/courses/[slug]/dashboard`  | Learner progress and mastery breakdown |
| `/courses/[slug]/results`    | Score breakdown by domain            |
| `/leaderboard`               | Weekly global XP leaderboard         |
| `/developer`                 | Developer dashboard                  |
| `/developer/courses`         | Manage courses                       |
| `/developer/courses/[slug]/edit` | Course and card editor           |
| `/developer/courses/[slug]/versions` | Version history              |
| `/developer/generate`        | Generate new courses from wiki       |
| `/admin`                     | Enrollment and completion analytics  |

### API Routes

**Learner:**

| Endpoint                | Purpose                                  |
|-------------------------|------------------------------------------|
| `POST /api/enroll`      | Enroll user in a course                  |
| `GET /api/enrollments`  | List user enrollments                    |
| `POST /api/progress`    | Record card completion, award XP/badges  |
| `GET /api/progress/[slug]` | Get course progress                   |
| `POST /api/tutor`       | Stream AI tutor responses                |
| `POST /api/practice`    | Generate practice questions on weak concepts |
| `POST /api/events`      | Record interaction events for analytics  |
| `GET /api/gamification`  | Fetch user streaks, XP, and badges      |
| `GET /api/leaderboard`  | Get weekly leaderboard rankings          |

**Developer:**

| Endpoint                | Purpose                                  |
|-------------------------|------------------------------------------|
| `POST /api/developer/courses` | Create a new course draft           |
| `GET/PUT /api/developer/courses/[slug]` | Read/update course draft  |
| `POST /api/developer/courses/[slug]/publish` | Publish draft to production |
| `POST /api/developer/courses/[slug]/unpublish` | Revert to previous version |
| `GET /api/developer/courses/[slug]/versions` | Version history         |
| `POST /api/developer/cards` | Create a card draft                   |
| `GET/PUT/DELETE /api/developer/cards/[cardId]` | Manage card drafts   |
| `POST /api/developer/cards/reorder` | Reorder cards within a course  |
| `POST /api/developer/ai-assist` | AI generation helper              |
| `POST /api/developer/generate` | Generate course from wiki          |

**Cron:**

| Endpoint                | Purpose                                  |
|-------------------------|------------------------------------------|
| `POST /api/cron/evaluate` | Aggregate card and domain metrics      |
| `POST /api/cron/profiler` | Generate learner profiles              |

### Components

**Card players** render each card type during the learning experience:
- `CardPlayer` — Main playback engine that delegates to type-specific components
- `PageCard` — Lesson content with structured sections (code, concepts, key points, comparisons, exam tips)
- `QuizCard` — Multiple-choice with misconception-targeted feedback
- `ScenarioCard` — Branching decision trees with scoring
- `ReflectionCard` — Open-ended prompts
- `MasteryCheckpoint` — Domain mastery gates between sections

**Developer editors** provide a course creation UI:
- `CourseEditor` — Course metadata editor
- `CardList` — Card browser with drag-to-reorder
- `PageCardEditor`, `QuizCardEditor`, `ScenarioCardEditor`, `ReflectionCardEditor` — Type-specific card editors
- `MetadataPanel` — Card metadata (domain, difficulty, tags)
- `AIChatPanel` — AI generation assistant for content creation

**Shared UI:** `NavBar`, `NavHint`, `TutorPanel`, `StreakDisplay`, `XpToast`, `Leaderboard`

### AI Tutor

The tutor streams responses from Claude with five layers of context:

1. Current card content and metadata
2. Prerequisite cards from the concept graph
3. Related wiki pages
4. Learner profile (mastery levels, weak concepts)
5. Conversation history (last 5 interactions)

Rate-limited to 20 messages/hour per user. All conversations are stored for profile updates.

### Adaptive Learning

The adaptive router (`lib/adaptive-router.ts`) personalizes the learning path:

- Reorders cards to prioritize weak domains (mastery < 50%)
- Skips page cards in mastered domains (mastery > 85%)
- Never skips quiz, scenario, or reflection cards
- Injects remediation page cards after quiz failures
- Mastery checkpoints appear after each quiz/scenario with domain-level feedback

### Gamification

XP, streaks, and badges are awarded via `lib/gamification.ts`:

- **XP** — Cards award 10-25 XP by type, with bonuses for high scores, perfect quizzes (+50), course completion (+200), passing (+300), and streak milestones
- **Streaks** — Tracked via `activity_days` table; current and longest streaks on user record
- **Badges** — 8 achievements (First Steps, Graduate, Perfectionist, On Fire, Inferno, Renaissance, Speed Demon, Triple Crown)
- **Leaderboard** — Weekly global rankings by XP

## CI/CD

Two GitHub Actions workflows:

- **test.yml** — Runs on PRs to main: validates course structure, runs Vitest unit tests
- **publish-content.yml** — Runs on push to main when `courses/**` changes: publishes content to PostgreSQL

The app is deployed on Vercel with automatic deploys from main.

## Key Design Decisions

- **Wiki as source of truth** — All course content derives from the wiki. Regenerating a course re-reads wiki pages, so updates flow through naturally.
- **Hash-based idempotent publishing** — Content is only written to the database when it actually changes, making deploys safe to re-run.
- **Schema separation** — Content and learner data live in separate PostgreSQL schemas. Content is CI-controlled; learner data is app-controlled.
- **Draft/publish workflow** — Developers edit drafts, then publish atomically with version history and rollback support.
- **Streaming tutor responses** — The tutor endpoint uses ReadableStream for real-time chat via the Vercel AI SDK.
- **Claude Code as orchestrator** — Skills (`.claude/skills/`) encode the workflows for ingestion, generation, and maintenance, making the LLM the primary operator of the content pipeline.
- **Append-only XP ledger** — All XP awards are logged in `xp_events` for auditability; `total_xp` on the user record is the running sum.
- **LLM evaluation pipeline** — Card quality is scored by LLM-as-judge and combined with human interaction metrics to identify cards that need regeneration.
