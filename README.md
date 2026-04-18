# coffeeandai

An AI platform built on [Andrej Karpathy's LLM Wiki concept](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The idea is simple: let an LLM maintain a structured knowledge base from curated sources, then build useful applications on top of that knowledge.

The wiki serves as a living, interconnected knowledge graph — source summaries, entity pages, concept pages, all cross-referenced with wikilinks. From there, the platform can power a growing set of AI-driven solutions.

## How It Works

### The Wiki Layer

1. **Curate sources** — Drop articles, PDFs, Google Docs, web pages, or videos into `raw/`.
2. **Wikify** — The LLM reads sources and generates structured wiki pages with summaries, entities, and concepts, all interlinked.
3. **Query** — Ask questions and get synthesized answers with citations from the wiki.

### The Application Layer

The wiki feeds into applications that turn knowledge into experiences. The web platform is built with Next.js, backed by PostgreSQL (Neon), and uses Claude as the AI engine.

See [architecture.md](architecture.md) for the full system design.

## Solutions

### CoffeeAndAI — Learn AI With a Coffee

The first application built on the platform. CoffeeAndAI generates personalized certification training courses and acts as an AI-powered tutor.

**How it works:**
- Wiki content is transformed into structured courses with four card types: lessons, quizzes, branching scenarios, and reflections.
- A concept prerequisite graph ensures topics are presented in the right order.
- An AI tutor (powered by Claude) is available on every card, with full context of the material, prerequisites, and the learner's strengths and weaknesses.

**Adaptive learning:**
- Cards are reordered based on learner domain mastery — weak domains are prioritized, mastered page cards are skipped.
- Mastery checkpoints appear after quizzes with domain-level feedback.
- Remediation cards are injected after quiz failures.
- A dedicated practice mode generates AI questions targeting weak concepts.

**Gamification:**
- XP earned for completing cards, passing quizzes, streaks, and course completion.
- Streak tracking with milestone rewards (7-day, 30-day).
- 8 achievement badges (First Steps, Perfectionist, On Fire, etc.).
- Weekly global leaderboard.

**First course: Claude Certified Architect Exam Prep**
- 31 cards across 5 exam domains
- Progressive difficulty (recall, application, analysis)
- Domain-weighted scoring aligned with the actual exam
- Personalized tutoring that adapts to each learner's profile

Try it at [coffeeandai.xyz](https://coffeeandai.xyz).

## Skills

All workflows are driven by [Claude Code](https://claude.com/claude-code) skills:

| Skill | Description |
|-------|-------------|
| `/fetch` | Fetch content from URLs or file paths, auto-detect type, and convert to markdown |
| `/web` | Fetch web pages and convert to markdown |
| `/pdf` | Convert PDF files to markdown |
| `/gdoc` | Fetch Google Docs and convert to markdown |
| `/video` | Transcribe video/audio files to markdown |
| `/crawl` | Recursively crawl a documentation site, converting each page to markdown |
| `/wikify` | Process raw sources into wiki pages — creates summaries, entities, and concept pages |
| `/query` | Search the wiki and synthesize an answer with citations |
| `/generate-course` | Generate a card-based certification training course from wiki content |
| `/generate-card` | Regenerate a single card within an existing course |
| `/generate-audio` | Generate TTS audio from speaker notes and upload to Vercel Blob |
| `/generate-images` | Generate AI illustrations for course cards and upload to Vercel Blob |
| `/lint` | Health-check the wiki for contradictions, orphans, missing links, and stale content |
| `/bugfix` | Check Sentry errors, Axiom logs, and other monitoring sources for bugs, then fix them with regression tests |

## Project Structure

```
raw/              # Immutable source documents
wiki/             # LLM-maintained knowledge base
courses/          # Generated course content (cards, graphs)
web/              # Next.js web application
db/               # Database schema
scripts/          # Publishing, validation, evaluation, and media generation tools
fetch/            # Source ingestion pipeline
.claude/skills/   # Claude Code skills for all workflows
```

## License

Apache-2.0
