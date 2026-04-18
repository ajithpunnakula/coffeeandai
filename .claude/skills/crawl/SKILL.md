---
name: crawl
description: Recursively crawl a documentation site, converting each page to markdown
user-invocable: false
allowed-tools: Read, Bash, Glob, Grep
---

# /crawl

Recursively crawl a documentation site starting from a root URL, using LLM judgment to follow related links and converting each page to markdown.

## Usage

```
/crawl <start_url> [-o output_dir] [-d max_depth]
```

Defaults: `-o output/`, `-d 2`

## Workflow

1. Parse arguments: extract start URL, `-o <dir>` (default `output/`), `-d <depth>` (default `2`).
2. Create the output directory if needed: `mkdir -p <output_dir>`
3. Initialize state:
   - `visited`: set of normalized URLs already processed (fetched or skipped)
   - `queue`: list of `(url, depth)` pairs, starting with `[(start_url, 0)]`
   - `results`: list of `{url, path, status}` for final report
   - `max_pages`: 50 (safety cap)
4. Process the queue in **breadth-first order**:

   For each `(url, depth)` popped from the queue:

   a. **Skip** if the normalized URL is already in `visited`.
   b. Add the normalized URL to `visited`.
   c. **Fetch and convert** the page:
      ```bash
      bash fetch/parsers/web.sh "<url>" "<output_dir>"
      ```
      - On success: record the output file path in results.
      - On failure: record the error, continue to next URL. Do NOT extract links from failed pages.
   d. **Check limits**: if `len(results) >= max_pages`, stop and report.
   e. If `depth < max_depth`, **extract links**:
      ```bash
      bash fetch/links.sh "<url>"
      ```
      This outputs TSV: `<absolute_url>\t<link_text>` per line.
   f. **Filter links** — classify each extracted link as **follow** or **skip**:

      **Follow** (add to queue at `depth + 1`):
      - Same domain as start URL
      - Shares a URL path prefix with the start URL (e.g., if start is `/en/docs/claude-code`, follow `/en/docs/claude-code/settings` but not `/en/docs/agents`)
      - Link text suggests documentation content (e.g., page titles, section names)

      **Skip** (do not follow):
      - Different domain
      - Same domain but outside the start URL's path prefix
      - URLs containing `/api/`, `/auth/`, `/login/`, `/signup/`, `/download/`, `/changelog/`
      - File extensions: `.pdf`, `.zip`, `.tar.gz`, `.png`, `.jpg`, `.svg`, `.gif`
      - Anchors to same page (already stripped by links.sh, but verify)
      - URLs already in `visited`

      Use your judgment for edge cases. When uncertain, prefer to **follow** — the user can always delete unwanted files.

   g. Add filtered URLs to the queue as `(url, depth + 1)`.
   h. **Pace requests**: wait 1 second between fetches to avoid rate limiting: `sleep 1`

5. After the queue is empty (or max_pages reached), **report results**:
   - List all successfully fetched pages with their output file paths
   - List any failures with error messages
   - Total counts: fetched, failed, skipped

## Important

- Do NOT clean up or enrich content — just fetch and convert.
- Do NOT modify frontmatter beyond what `web.sh` generates.
- If a page fails, log it and move on — do not abort the crawl.
- If the queue grows beyond `max_pages`, stop and tell the user how many remain.
- The output directory can point to another project (e.g., `-o ~/code/llm-wiki/raw/`).

## Example

```
/crawl https://docs.anthropic.com/en/docs/claude-code -o ~/code/llm-wiki/raw/ -d 2
```

This fetches the Claude Code docs root, follows all related doc links up to 2 levels deep, and writes markdown files to the llm-wiki raw directory.
