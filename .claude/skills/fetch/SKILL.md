---
name: fetch
description: Fetch content from URLs or file paths, auto-detect type, and convert to markdown
user-invocable: true
allowed-tools: Read, Write, Glob, Grep, Bash
---

# /fetch

Fetch content from one or more URLs or file paths, auto-detect the source type, and convert to markdown.

## Usage

```
/fetch <url-or-path> [url2 ...] [-o output_dir]
```

## Workflow

1. Parse arguments. Extract `-o <dir>` if present (default: `output/`).
2. For each source URL or path:
   a. Run: `bash fetch/ingest.sh "<source>" -o "<output_dir>"`
      - ingest.sh auto-detects the source type (Google Drive, Google Docs, PDF, video, web) and routes to the appropriate parser.
   b. Check exit code. If the script fails:
      - Read stderr for the error message.
      - If a tool is missing, tell the user the install command.
      - If auth is needed (Google Drive), tell user to run `gcloud auth application-default login`.
      - If the conversion failed, suggest retrying with a different adapter.
   c. If successful, note the output file path (last line of stdout).
3. Report results: list all output files for successful fetches, and errors for failures.

## Notes

- Do NOT clean up or enrich the content — just fetch and convert.
- Do NOT modify frontmatter beyond what the script generates.
- The output directory can point directly to another project's directory (e.g., `-o ~/code/llm-wiki/raw/`).
- Google Drive URLs are auto-detected: file type is determined from Drive API metadata.
