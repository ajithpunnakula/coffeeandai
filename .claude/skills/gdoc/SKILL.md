---
name: gdoc
description: Fetch Google Docs and convert to markdown
user-invocable: true
allowed-tools: Read, Bash
---

# /gdoc

Fetch one or more Google Docs and convert to markdown.

## Usage

```
/gdoc <url> [url2 ...] [-o output_dir]
```

## Workflow

1. Parse arguments. Extract `-o <dir>` if present (default: `output/`).
2. For each URL, run: `bash fetch/parsers/gdoc.sh "<url>" "<output_dir>"`
3. Check exit code. On failure:
   - If auth error, tell the user to run `gcloud auth application-default login`.
   - Otherwise, report the error from stderr.
4. On success, report the output file path (last line of stdout).

## Notes

- Public docs work without auth. Private docs require `gcloud auth application-default login`.
- Exports as HTML via Drive API, then converts to markdown with `markitdown` or `pandoc`.
- Do NOT clean up or enrich the content.
