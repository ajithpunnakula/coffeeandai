---
name: generate-audio
description: Generate TTS audio from speaker_notes and upload to Vercel Blob
user-invocable: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generate Audio

Generate TTS narration for all page cards with speaker_notes in a course.

## Usage

`/generate-audio <course-slug>`

Example: `/generate-audio claude-architect`

## Workflow

1. Read `.env` to load `OPENAI_API_KEY` and `BLOB_READ_WRITE_TOKEN`.
2. Scan all cards in `courses/<slug>/cards/` for page cards with `speaker_notes`.
3. Load `courses/<slug>/.enrichment-hashes.json` if it exists to check for already-generated audio.
4. For each page card that needs audio (no audio field, or hash has changed):
   a. Call OpenAI TTS API (`tts-1-hd` model, voice `alloy`) with the speaker_notes text.
   b. Upload the MP3 to Vercel Blob at path `courses/<slug>/audio/<card-id>.mp3`.
   c. Update the card's frontmatter to add `audio: "<blob-url>"`.
   d. Update `.enrichment-hashes.json` with the MD5 hash of the speaker_notes.
5. Use a consistent voice per course (default: `alloy`).
6. Run the media validator after completion:
   ```bash
   npx tsx scripts/validate-media.ts courses/<slug>
   ```
7. Fix any failures before completing.

## OpenAI TTS API

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1-hd",
    "input": "<speaker_notes text>",
    "voice": "alloy",
    "response_format": "mp3"
  }' \
  --output audio.mp3
```

## Vercel Blob Upload

```bash
curl -X PUT "https://blob.vercel-storage.com/courses/<slug>/audio/<card-id>.mp3" \
  -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
  -H "Content-Type: audio/mpeg" \
  -H "x-api-version: 7" \
  --data-binary @audio.mp3
```

## Hash Tracking

`.enrichment-hashes.json` format:
```json
{
  "01-welcome.md": { "audio_hash": "a1b2c3d4" },
  "02-agentic-loop.md": { "audio_hash": "e5f6g7h8" }
}
```

Hash is first 8 chars of MD5 of the speaker_notes content. Skip regeneration when hash matches.
