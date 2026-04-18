---
name: video
description: Transcribe video/audio files to markdown
user-invocable: false
allowed-tools: Read, Bash
---

# /video

Transcribe one or more video or audio files to markdown.

## Usage

```
/video <path-or-url> [path2 ...] [-o output_dir]
```

## Workflow

1. Parse arguments. Extract `-o <dir>` if present (default: `output/`).
2. For each source:
   - If it's a Google Drive URL, run: `bash fetch/ingest.sh "<url>" -o "<output_dir>"` (handles download via Drive API + transcription).
   - If it's an HTTP URL, run: `bash fetch/ingest.sh "<url>" -o "<output_dir>"` (handles download + transcription).
   - If it's a local file, run: `bash fetch/parsers/video.sh "<path>" "<output_dir>"`
3. Check exit code. On failure, read stderr and report the error.
4. On success, report the output file path (last line of stdout).

## Notes

- Requires `ffmpeg` (audio extraction) and `whisper` (transcription).
- For Google Drive videos, requires `gcloud auth application-default login`.
- Do NOT clean up or enrich the content.
