# LLM Wiki Schema

This is a personal knowledge base maintained by an LLM following the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The human curates sources and asks questions. The LLM writes and maintains all wiki content.

## Directory structure

```
raw/              # Immutable source documents (articles, papers, notes). Never modify these.
raw/assets/       # Downloaded images referenced by sources.
wiki/             # LLM-generated and LLM-maintained markdown pages. The LLM owns this entirely.
wiki/index.md     # Content catalog — every wiki page listed with link, summary, and metadata.
wiki/log.md       # Chronological append-only record of all operations.
```

## Page types

Each wiki page has YAML frontmatter and uses Obsidian-compatible `[[wikilinks]]` for cross-references.

### Source summary
One per ingested source. Summarizes key claims, arguments, and data.
```yaml
---
title: "Source Title"
type: source
date: 2026-04-11
source_file: "raw/filename.md"
tags: [topic1, topic2]
---
```

### Entity page
A person, organization, product, tool, or benchmark that appears across sources.
```yaml
---
title: "Entity Name"
type: entity
tags: [category]
sources: ["raw/file1.md", "raw/file2.md"]
---
```

### Concept page
An idea, technique, pattern, or framework discussed across sources.
```yaml
---
title: "Concept Name"
type: concept
tags: [category]
sources: ["raw/file1.md", "raw/file2.md"]
---
```

### Comparison / Analysis
Generated from queries. Side-by-side comparisons, deep analyses, or synthesis across multiple pages.
```yaml
---
title: "X vs Y"
type: analysis
date: 2026-04-11
tags: [topic]
---
```

### Overview
A high-level synthesis page that ties together the major themes across all sources.
```yaml
---
title: "Overview"
type: overview
---
```

## Wikilink conventions

- Link to other wiki pages using `[[Page Title]]`.
- Link to source summaries using `[[Source - Article Title]]`.
- Every entity and concept mentioned should link to its page. Create the page if it doesn't exist.
- Aim for no orphan pages — every page should have at least one inbound link.

## Index format (wiki/index.md)

Organized by section. Each entry is one line:
```
- [[Page Title]] — one-line summary (N sources)
```

Sections: Overview, Sources, Entities, Concepts, Analyses.

## Log format (wiki/log.md)

Append-only. Each entry:
```
## [YYYY-MM-DD] action | Title
Brief description of what was done.
```

Actions: `ingest`, `query`, `lint`, `update`.

## Workflows

### Ingest
1. Read the source file from `raw/`.
2. Create a source summary page: `wiki/Source - Title.md`.
3. Identify entities and concepts. For each:
   - If a page exists, update it with new information and add the source to its `sources` list.
   - If no page exists, create it.
4. Update `wiki/index.md` with any new or changed pages.
5. Append an entry to `wiki/log.md`.
6. If contradictions arise between sources, note them explicitly on the relevant pages.

### Query
1. Read `wiki/index.md` to find relevant pages.
2. Read those pages and synthesize an answer with `[[wikilink]]` citations.
3. If the answer is substantial and reusable, file it as a new analysis page in the wiki.

### Lint
Scan all wiki pages and check for:
- Contradictions between pages.
- Orphan pages (no inbound links from other wiki pages).
- Concepts or entities mentioned in text but lacking their own page.
- Missing cross-references (pages that should link to each other but don't).
- Stale claims superseded by newer sources.
- Index entries that are missing or out of date.
Output a report, then fix issues or flag them for the user.
