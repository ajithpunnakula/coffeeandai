---
name: web
description: Fetch web pages and convert to markdown
user-invocable: true
allowed-tools: Read, Bash
---

# /web

Fetch one or more web pages and convert to markdown.

## Usage

```
/web <url> [url2 ...] [-o output_dir]
```

## Workflow

1. Parse arguments. Extract `-o <dir>` if present (default: `output/`).
2. For each URL, run: `bash fetch/parsers/web.sh "<url>" "<output_dir>"`
3. Check exit code. On failure, read stderr and report the error.
4. On success, report the output file path (last line of stdout).

## Notes

- Uses `markitdown` as primary converter, falls back to `curl` + `pandoc`.
- Do NOT clean up or enrich the content.
