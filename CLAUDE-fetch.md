# wiki-fetch

A CLI tool and AI-agent project for fetching content from diverse sources and converting it to markdown.

## What this tool does

Fetches content from web pages, Google Docs, Google Drive files, PDFs, and videos, converts it to markdown with YAML frontmatter, and writes it to an output directory. That's it — no cleanup, no tagging, no knowledge extraction. Downstream tools (like an LLM wiki) handle enrichment.

## Architecture

The ingestion layer separates two concerns:

- **Sources** (`scripts/sources/`) — where files come from (Google Drive, web, local). Handle auth, download, metadata.
- **Parsers** (`scripts/parsers/`) — how to convert content to markdown (PDF, video, HTML, gdoc). Stateless, single-file converters.

`scripts/ingest.sh` is the orchestrator: it detects the source type, downloads if needed, determines content type, and routes to the appropriate parser.

## Directory structure

```
scripts/
  lib.sh              # Shared utilities (slugify, frontmatter, detect type, URL helpers)
  ingest.sh           # Orchestrator: detect source → download → route to parser
  links.sh            # Extract all links from a web page (TSV output)
  sources/
    gdrive.sh         # Google Drive: auth, metadata, download, path resolution
  parsers/
    web.sh            # Web page URL → markdown
    pdf.sh            # Local PDF file → markdown
    gdoc.sh           # Google Doc → markdown (exports via API)
    video.sh          # Local video/audio file → transcript markdown
output/               # Default output directory (gitignored)
```

## Script interface contract

### Parsers (`scripts/parsers/*.sh`)

**Input:**
- `$1` — local file path (or URL for web.sh/gdoc.sh)
- `$2` — output directory (default: `output/`)
- `$3` — source URL (optional, for frontmatter)
- `$4` — source path (optional, folder path in source system)

**Output:**
- Exit 0 + print output file path on last line of stdout
- Exit 1 + error message on stderr

### Orchestrator (`scripts/ingest.sh`)

**Input:**
- `$1` — source URL or local file path
- `-o <dir>` — output directory (default: `output/`)

**Output:**
- Same as parsers. Handles download, type detection, and routing automatically.

### Frontmatter

```yaml
---
title: "Document Title"
source: "https://original-url"
author: ""
published:
created: 2026-04-11
description: ""
source_path: "Folder/Subfolder/filename.ext"  # optional, for tree-sourced files
tags:
  - "clippings"
---
```

## Skills

- `/fetch <urls...> [-o dir]` — main entry point, auto-detects source type via `ingest.sh`
- `/web <urls...> [-o dir]` — force web parser
- `/pdf <paths-or-urls...> [-o dir]` — force PDF parser
- `/gdoc <urls...> [-o dir]` — force Google Doc parser
- `/video <paths-or-urls...> [-o dir]` — force video parser
- `/crawl <url> [-o dir] [-d max_depth]` — recursively crawl a doc site, LLM filters related links

## What the LLM does in this project

- Route ambiguous URLs to the right parser
- Handle auth failures conversationally
- Retry with fallback tools when a converter fails
- Batch orchestration (report successes and failures)

## What the LLM does NOT do

- No content cleanup
- No metadata enrichment beyond what scripts extract
- No tagging or categorization
- No entity/concept extraction

## Adding a new parser

1. Create `scripts/parsers/<name>.sh` following the parser interface contract
2. Create `.claude/skills/<name>/SKILL.md`
3. Add MIME type mapping in `detect_type_mime` in `scripts/lib.sh`
4. Update `detect_type` in `scripts/lib.sh` if URL patterns need matching
5. Add routing in `scripts/ingest.sh`
6. Document dependencies at the top of the script

## Adding a new source

1. Create `scripts/sources/<name>.sh` with auth, download, metadata, and list functions
2. Add source detection in `detect_type` in `scripts/lib.sh`
3. Add routing in `scripts/ingest.sh`

## Testing

Tests use [bats-core](https://github.com/bats-core/bats-core) with bats-assert, bats-support, and bats-file (installed as git submodules in `test/libs/`).

```bash
brew install bats-core           # Test framework
bats test/                       # Run all tests
bats test/lib.bats               # Unit tests only (fast, no network)
bats test/ingest.bats            # Orchestrator integration tests
bats test/web.bats               # Web integration tests
bats test/pdf.bats               # PDF integration tests
bats test/video.bats             # Video/audio integration tests (requires ffmpeg + whisper)
bats test/gdoc.bats              # Google Doc integration tests (public docs, no auth needed)
bats test/links.bats             # Link extraction tests
```

**Run tests before every commit.** Integration tests make real HTTP requests to stable public URLs (example.com, arxiv.org, irs.gov, Internet Archive, Google Docs). Video tests require ffmpeg and whisper installed locally.

### Test structure

- `test/test_helper.bash` — shared setup, assertion helpers (frontmatter validation, content checks)
- `test/lib.bats` — unit tests for `scripts/lib.sh` (slugify, detect_type, detect_type_mime, output_path, frontmatter, parse_args)
- `test/ingest.bats` — orchestrator tests (type routing, web/pdf/gdoc via ingest)
- `test/web.bats` — integration tests with example.com, Python docs, Wikipedia
- `test/pdf.bats` — integration tests with IRS W-9, arxiv paper
- `test/video.bats` — integration tests with Internet Archive audio
- `test/gdoc.bats` — integration tests with public Angular design doc on Google Docs
- `test/links.bats` — integration tests for link extraction from web pages

### Adding tests for a new parser

1. Create `test/<name>.bats`
2. Load `test_helper` and use `assert_valid_frontmatter`, `assert_frontmatter_field`, `assert_has_content`
3. Include at least one success case with a stable public URL and one error case

## Configuration

- `WIKI_FETCH_OUTPUT` — default output directory for all parsers and the orchestrator. Falls back to `output/` if unset. Set via `.envrc` (gitignored) for local development.

## Tool dependencies

```bash
pip install markitdown          # Web, PDF, docx conversion
brew install poppler            # pdftotext/pdfinfo (PDF fallback)
brew install ffmpeg             # Video audio extraction
pip install openai-whisper      # Local transcription
# Google auth: gcloud CLI for Drive API access
```
