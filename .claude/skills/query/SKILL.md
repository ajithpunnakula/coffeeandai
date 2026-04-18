---
name: query
description: Search the wiki and synthesize an answer with citations
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__qmd_search
---

# Query the Wiki

Answer questions by searching the wiki and synthesizing information with citations.

## Workflow

1. Search for relevant pages using **qmd** (MCP tool `mcp__qmd_search`) if available. Also read `wiki/index.md` for an overview.
   - If qmd is not available, fall back to reading `wiki/index.md` and using Grep to search wiki pages.
2. Read the relevant wiki pages.
3. Synthesize an answer using information from those pages.
4. Cite sources using `[[wikilinks]]` (e.g., "According to [[Source - Article Title]]...").
5. If the answer is substantial and reusable, ask the user if it should be filed as a new analysis page in `wiki/`.

## If filing as a wiki page

1. Create `wiki/<descriptive-title>.md` with type `analysis` frontmatter.
2. Update `wiki/index.md` under the Analyses section.
3. Append to `wiki/log.md`: `## [YYYY-MM-DD] query | <Question summary>`
4. Commit and push:
   ```bash
   git add wiki/
   git commit -m "wiki: query - <short description>"
   git push
   ```

## If no relevant pages found

Tell the user what's missing and suggest sources that could fill the gap.
