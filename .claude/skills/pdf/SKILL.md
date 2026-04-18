---
name: pdf
description: Convert PDF files to markdown
user-invocable: false
allowed-tools: Read, Bash
---

# /pdf

Convert one or more PDF files to markdown.

## Usage

```
/pdf <path-or-url> [path2 ...] [-o output_dir]
```

## Workflow

1. Parse arguments. Extract `-o <dir>` if present (default: `output/`).
2. For each source:
   - If it's a URL, run: `bash fetch/ingest.sh "<url>" -o "<output_dir>"` (handles download + conversion).
   - If it's a local file, run: `bash fetch/parsers/pdf.sh "<path>" "<output_dir>"`
3. Check exit code. On failure, read stderr and report the error.
4. On success, report the output file path (last line of stdout).

## Notes

- Uses `markitdown` as primary converter, falls back to `pdftotext`.
- Do NOT clean up or enrich the content.
