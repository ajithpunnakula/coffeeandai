---
name: wikify
description: Process raw sources into wiki pages — creates summaries, entities, and concept pages
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Ingest Sources

Process raw source files into the wiki following the schema in CLAUDE.md.

## Auto-detection

If no `$ARGUMENTS` are provided, auto-detect new sources:

1. List all `.md` files in `raw/` (excluding `raw/assets/`).
2. Read `wiki/log.md` and extract all previously ingested source filenames.
3. Identify files in `raw/` that have not been ingested yet.
4. If no new sources found, report "No new sources to ingest" and stop.
5. Process each new source using the workflow below.

If `$ARGUMENTS` is provided (e.g., `/ingest raw/article.md`), process only that specific file.

## Ingest workflow (per source)

Follow the Ingest workflow defined in `CLAUDE.md`:

1. Read the source file from `raw/`.
2. Create a source summary page: `wiki/Source - <Title>.md` with proper YAML frontmatter.
3. Identify entities (people, orgs, tools, benchmarks) and concepts (ideas, techniques, patterns).
4. For each entity/concept:
   - If a wiki page exists, update it with new information and add the source to its `sources` list.
   - If no page exists, create it with proper frontmatter and `[[wikilinks]]`.
5. Update `wiki/index.md` with any new or changed pages.
6. Append an entry to `wiki/log.md` with format: `## [YYYY-MM-DD] ingest | Source Title`
7. If contradictions with existing wiki content arise, note them explicitly on the relevant pages.

## After all sources are ingested

Commit and push all changes to GitHub:

```bash
git add wiki/ CLAUDE.md
git commit -m "wiki: ingest <source names>"
git push
```

## Output

Report to the user:
- Which sources were ingested
- What pages were created or updated
- Any contradictions or notable findings
