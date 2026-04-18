---
name: generate-images
description: Generate AI illustrations for course cards and upload to Vercel Blob
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generate Images

Generate AI illustrations for selected course cards using GPT Image 1.

## Usage

`/generate-images <course-slug>`

Example: `/generate-images claude-architect`

## Workflow

1. Read `.env` to load `OPENAI_API_KEY` and `BLOB_READ_WRITE_TOKEN`.
2. Scan cards for `image: "TODO: <description>"` markers.
3. For each card with a TODO image:
   a. Use the description to generate an illustration via GPT Image 1.
   b. Upload the PNG to Vercel Blob at path `courses/<slug>/images/<card-id>.png`.
   c. Update the card's frontmatter: replace `image: "TODO: ..."` with `image: "<blob-url>"`.
   d. Update `.enrichment-hashes.json` with the image description hash.
4. Use illustrations selectively — only where a visual genuinely aids understanding (architecture diagrams, flow charts, concept maps).
5. Run the media validator after completion:
   ```bash
   npx tsx scripts/validate-media.ts courses/<slug>
   ```

## GPT Image 1 API

```bash
curl https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "<description>",
    "n": 1,
    "size": "1024x1024",
    "quality": "medium"
  }'
```

## Vercel Blob Upload

```bash
curl -X PUT "https://blob.vercel-storage.com/courses/<slug>/images/<card-id>.png" \
  -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
  -H "Content-Type: image/png" \
  -H "x-api-version: 7" \
  --data-binary @image.png
```
