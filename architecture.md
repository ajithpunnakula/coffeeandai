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
            |  content.*  |  learner.*   |
            +--------------+--------------+
                           |
                  +--------v--------+
                  |  Next.js Web App |
                  |  (web/src/app)   |
                  +--------+--------+
                           |
         +---------+-------+-------+---------+
         |         |       |       |         |
   Course Player  Tutor  Practice  Gamify  Admin
```

## Directory Structure

```
coffeeandai/
├── raw/                  # Immutable source documents (articles, docs, guides)
├── wiki/                 # LLM-generated knowledge base (summaries, entities, concepts)
├── courses/              # Generated course content
│   └── claude-architect/ # Course manifest, cards, prerequisite graph
├── web/                  # Next.js application
│   └── src/
│       ├── app/          # Pages, API routes, layouts
│       ├── components/   # Card players, tutor panel, gamification UI
│       └── lib/          # Database, profiler, adaptive router, gamification
├── db/                   # PostgreSQL schema (content + learner schemas)
├── scripts/              # Publishing, validation, evaluation, audio/media generation
├── fetch/                # Source ingestion pipeline (parsers for web, PDF, gdoc, video)
└── .claude/skills/       # Claude Code skills powering the workflows
```

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Framework      | Next.js 16 (App Router, React 19)                |
| Styling        | Tailwind CSS 4, Framer Motion                    |
| Database       | PostgreSQL via Neon Serverless, Drizzle ORM       |
| Auth           | Clerk (OAuth, role-based access)                  |
| AI             | Claude API (Sonnet for tutor, Opus for generation)|
| Media          | OpenAI TTS, GPT Image 1, Vercel Blob storage     |
| Monitoring     | Sentry (errors), Axiom (logs), Vercel Analytics   |
| Testing        | Vitest (unit), Playwright (E2E)                   |

## Data Pipeline

### 1. Source Ingestion

Raw sources (articles, PDFs, Google Docs, web pages, videos) are downloaded into `raw/` and never modified. The `/wikify` skill processes them into structured wiki pages with YAML frontmatter and `[[wikilinks]]` for cross-referencing.

### 2. Wiki

The wiki is an LLM-maintained knowledge base with four page types:

- **Source summaries** — Key claims and arguments from each source
- **Entity pages** — People, orgs, tools, benchmarks that appear across sources
- **Concept pages** — Ideas, techniques, and patterns discussed across sources
- **Analyses** — Comparisons and synthesis generated from queries

All pages use Obsidian-compatible wikilinks. `wiki/index.md` catalogs every page.

### 3. Course Generation

The `/generate-course` skill reads wiki pages and produces:

- **course.md** — Manifest defining domains, card order, and pass threshold
- **graph.yaml** — Concept prerequisite DAG
- **cards/*.md** — Individual cards (page, quiz, scenario, reflection types)

### 4. Quality Evaluation

`scripts/evaluate-cards.ts` runs an LLM-as-judge pipeline scoring each card on clarity, accuracy, alignment, conciseness, and distractor quality. Results feed into `content.card_quality` and `scripts/regenerate-weak-cards.ts` flags low-scoring cards for regeneration.

### 5. Publishing

`scripts/publish-content.ts` reads course files, computes content hashes, and upserts to PostgreSQL only when content has changed. Multiple runs are safe (idempotent).

## Database Design

Two schemas enforce separation of concerns:

**`content.*`** (written by CI/publishing scripts, read-only for the app)
- `courses` — Metadata, domains, card ordering
- `cards` — Card content, type, difficulty, media URLs
- `graphs` — Concept prerequisites
- `card_metrics` / `domain_metrics` — Analytics aggregates
- `card_quality` — LLM eval scores (clarity, accuracy, alignment, conciseness) + human metrics + combined score

**`learner.*`** (written by the app)
- `users` — Synced from Clerk, includes total XP, streak tracking, badges
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
| `/courses/[slug]/practice`   | Practice mode (AI-generated weak concept questions) |
| `/courses/[slug]/dashboard`  | Learner progress and mastery breakdown |
| `/courses/[slug]/results`    | Score breakdown by domain            |
| `/leaderboard`               | Weekly global XP leaderboard         |
| `/admin`                     | Enrollment and completion analytics  |

### API Routes

| Endpoint                | Purpose                                  |
|-------------------------|------------------------------------------|
| `POST /api/enroll`      | Enroll user in a course                  |
| `POST /api/enrollments` | List user enrollments                    |
| `POST /api/progress`    | Record card completion, award XP/badges  |
| `GET /api/progress/[slug]` | Get course progress                   |
| `POST /api/tutor`       | Stream AI tutor responses                |
| `POST /api/practice`    | Generate practice questions on weak concepts |
| `POST /api/events`      | Record interaction events for analytics  |
| `GET /api/gamification`  | Fetch user streaks, XP, and badges      |
| `GET /api/leaderboard`  | Get weekly leaderboard rankings          |
| `GET /api/cron/evaluate` | Aggregate card and domain metrics       |
| `GET /api/cron/profiler` | Generate learner profiles (mastery, weak concepts) |

### Card Types

- **Page** — Educational content with markdown, optional audio narration and AI illustrations
- **Quiz** — Multiple-choice with misconception-targeted feedback
- **Scenario** — Branching decision trees with scoring
- **Reflection** — Open-ended prompts

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

## Key Design Decisions

- **Wiki as source of truth** — All course content derives from the wiki. Regenerating a course re-reads wiki pages, so updates flow through naturally.
- **Hash-based idempotent publishing** — Content is only written to the database when it actually changes, making deploys safe to re-run.
- **Schema separation** — Content and learner data live in separate PostgreSQL schemas. Content is CI-controlled; learner data is app-controlled.
- **Streaming tutor responses** — The tutor endpoint uses ReadableStream for real-time chat, avoiding waiting for full responses.
- **Claude Code as orchestrator** — Skills (`.claude/skills/`) encode the workflows for ingestion, generation, and maintenance, making the LLM the primary operator of the content pipeline.
- **Append-only XP ledger** — All XP awards are logged in `xp_events` for auditability; `total_xp` on the user record is the running sum.
- **LLM evaluation pipeline** — Card quality is scored by LLM-as-judge and combined with human interaction metrics to identify cards that need regeneration.
