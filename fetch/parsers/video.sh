#!/usr/bin/env bash
# video.sh — Transcribe a local video or audio file to markdown
# Requires: ffmpeg (brew install ffmpeg), whisper (pip install openai-whisper)
#
# Usage: bash scripts/parsers/video.sh <local-file> [output_dir] [source_url] [source_path]
#
# This parser accepts only local files. For Google Drive or URL downloads,
# use ingest.sh which handles download and routes to this parser.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../lib.sh"

setup_temp

LOCAL_FILE="$1"
OUTPUT_DIR="${2:-${WIKI_FETCH_OUTPUT:-output/}}"
SOURCE_URL="${3:-$LOCAL_FILE}"
SOURCE_PATH="${4:-}"
mkdir -p "$OUTPUT_DIR"

WHISPER_MODEL="${WHISPER_MODEL:-base}"

# --- Validate input ---
if [ -z "$LOCAL_FILE" ]; then
  echo "Error: No file provided" >&2
  echo "Usage: bash scripts/parsers/video.sh <local-file> [output_dir] [source_url] [source_path]" >&2
  exit 1
fi

if [ ! -f "$LOCAL_FILE" ]; then
  echo "Error: File not found: $LOCAL_FILE" >&2
  exit 1
fi

# --- Extract audio ---
require_cmd ffmpeg "brew install ffmpeg"

AUDIO_FILE="$WIKI_FETCH_TEMP/audio.wav"
MIME_TYPE=$(file -b --mime-type "$LOCAL_FILE" 2>/dev/null || echo "unknown")

if echo "$MIME_TYPE" | grep -q "audio/"; then
  # Already audio, just convert to wav
  ffmpeg -y -i "$LOCAL_FILE" -acodec pcm_s16le -ar 16000 "$AUDIO_FILE" 2>/dev/null
else
  # Extract audio from video
  ffmpeg -y -i "$LOCAL_FILE" -vn -acodec pcm_s16le -ar 16000 "$AUDIO_FILE" 2>/dev/null
fi

if [ ! -s "$AUDIO_FILE" ]; then
  echo "Error: Failed to extract audio from $LOCAL_FILE" >&2
  exit 1
fi

# --- Transcribe ---
require_cmd whisper "pip install openai-whisper"

whisper "$AUDIO_FILE" \
  --model "$WHISPER_MODEL" \
  --output_format txt \
  --output_dir "$WIKI_FETCH_TEMP" \
  >/dev/null 2>&1

TRANSCRIPT_FILE="$WIKI_FETCH_TEMP/audio.txt"
if [ ! -s "$TRANSCRIPT_FILE" ]; then
  echo "Error: Transcription produced no output" >&2
  exit 1
fi

# --- Build title ---
TITLE=$(basename "$LOCAL_FILE" | sed 's/\.[^.]*$//;s/-/ /g;s/_/ /g')

# --- Write output ---
OUT_FILE=$(output_path "$OUTPUT_DIR" "$TITLE" "$SOURCE_URL")
write_frontmatter "$OUT_FILE" "$TITLE" "$SOURCE_URL" "" "" "" "$SOURCE_PATH"

echo "## Transcript" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
cat "$TRANSCRIPT_FILE" >> "$OUT_FILE"

echo "$OUT_FILE"
