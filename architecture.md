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
                     | (wiki/*) |
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
              +------------+------------+
              |            |            |
        Course Player   AI Tutor   Admin Dashboard
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
│       ├── components/   # Card players, tutor panel, UI
│       └── lib/          # Database, profiler, tutor context
├── db/                   # PostgreSQL schema (content + learner schemas)
├── scripts/              # Publishing, validation, audio/media generation
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

### 4. Publishing

`scripts/publish-content.ts` reads course files, computes content hashes, and upserts to PostgreSQL only when content has changed. Multiple runs are safe (idempotent).

## Database Design

Two schemas enforce separation of concerns:

**`content.*`** (written by CI/publishing scripts, read-only for the app)
- `courses` — Metadata, domains, card ordering
- `cards` — Card content, type, difficulty, media URLs
- `graphs` — Concept prerequisites
- `card_metrics` / `domain_metrics` — Analytics aggregates

**`learner.*`** (written by the app)
- `users` — Synced from Clerk
- `enrollments` — Course enrollments
- `card_progress` — Per-card completion status and scores
- `completions` — Final scores, domain breakdowns, certificate hashes
- `interactions` — Tutor conversation history
- `profiles` — Aggregated learner strengths and weaknesses

## Web Application

### Pages

| Route                     | Purpose                              |
|---------------------------|--------------------------------------|
| `/courses`                | Course catalog                       |
| `/courses/[slug]`         | Course detail with enrollment        |
| `/courses/[slug]/play`    | Card-by-card player                  |
| `/courses/[slug]/results` | Score breakdown by domain            |
| `/admin`                  | Enrollment and completion analytics  |

### API Routes

| Endpoint              | Purpose                                  |
|-----------------------|------------------------------------------|
| `POST /api/enroll`    | Enroll user in a course                  |
| `POST /api/progress`  | Record card completion                   |
| `POST /api/tutor`     | Stream AI tutor responses                |
| `POST /api/events`    | Record interaction events for analytics  |
| `GET /api/cron/*`     | Periodic evaluation and profile updates  |

### Card Types

- **Page** — Educational content with markdown and optional audio narration
- **Quiz** — Multiple-choice with misconception-targeted feedback
- **Scenario** — Branching decision trees with scoring
- **Reflection** — Open-ended prompts

### AI Tutor

The tutor streams responses from Claude with four layers of context:

1. Current card content and metadata
2. Prerequisite cards from the concept graph
3. Related wiki pages
4. Learner profile (mastery levels, weak concepts)

Rate-limited to 20 messages/hour per user. All conversations are stored for profile updates.

## Key Design Decisions

- **Wiki as source of truth** — All course content derives from the wiki. Regenerating a course re-reads wiki pages, so updates flow through naturally.
- **Hash-based idempotent publishing** — Content is only written to the database when it actually changes, making deploys safe to re-run.
- **Schema separation** — Content and learner data live in separate PostgreSQL schemas. Content is CI-controlled; learner data is app-controlled.
- **Streaming tutor responses** — The tutor endpoint uses ReadableStream for real-time chat, avoiding waiting for full responses.
- **Claude Code as orchestrator** — Skills (`.claude/skills/`) encode the workflows for ingestion, generation, and maintenance, making the LLM the primary operator of the content pipeline.
