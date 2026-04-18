#!/usr/bin/env bash
# gdoc.sh — Fetch a Google Doc and convert to markdown
# Requires: curl, markitdown or pandoc
# Optional: gcloud CLI (for private docs)
#
# Usage: bash scripts/parsers/gdoc.sh <google-docs-url> [output_dir]
#
# Public docs work without auth. For private docs:
#   gcloud auth application-default login

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../lib.sh"
source "$SCRIPT_DIR/../sources/gdrive.sh"

setup_temp

URL="$1"
OUTPUT_DIR="${2:-${WIKI_FETCH_OUTPUT:-output/}}"
mkdir -p "$OUTPUT_DIR"

# --- Extract document ID ---
if [[ "$URL" != *docs.google.com/document* ]]; then
  echo "Error: Could not extract document ID from URL: $URL" >&2
  echo "Expected format: https://docs.google.com/document/d/<DOC_ID>/..." >&2
  exit 1
fi

DOC_ID=$(gdrive_extract_id "$URL")

if [ -z "$DOC_ID" ]; then
  echo "Error: Could not extract document ID from URL: $URL" >&2
  echo "Expected format: https://docs.google.com/document/d/<DOC_ID>/..." >&2
  exit 1
fi

# --- Export as HTML ---
HTML_FILE="$WIKI_FETCH_TEMP/document.html"
HTTP_CODE=""

# Try public export first (no auth needed for publicly shared docs)
HTTP_CODE=$(curl -sL -o "$HTML_FILE" -w "%{http_code}" \
  "https://docs.google.com/document/d/${DOC_ID}/export?format=html")

# If public export fails, try with gcloud auth
ACCESS_TOKEN=""
if [ "$HTTP_CODE" != "200" ] || [ ! -s "$HTML_FILE" ]; then
  ACCESS_TOKEN=$(gdrive_auth_token 2>/dev/null || true)
  if [ -n "$ACCESS_TOKEN" ]; then
    HTTP_CODE=$(curl -s -o "$HTML_FILE" -w "%{http_code}" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      "https://www.googleapis.com/drive/v3/files/${DOC_ID}/export?mimeType=text/html")
  fi
fi

if [ "$HTTP_CODE" != "200" ] || [ ! -s "$HTML_FILE" ]; then
  echo "Error: Failed to export document (HTTP $HTTP_CODE)" >&2
  echo "If the doc is private, install gcloud and run: gcloud auth application-default login" >&2
  exit 1
fi

# --- Fetch metadata via Drive API if gcloud is available ---
TITLE=""
AUTHOR=""
if [ -z "$ACCESS_TOKEN" ]; then
  ACCESS_TOKEN=$(gdrive_auth_token 2>/dev/null || true)
fi
if [ -n "$ACCESS_TOKEN" ]; then
  META=$(gdrive_metadata "$DOC_ID" "$ACCESS_TOKEN" 2>/dev/null || true)
  TITLE=$(gdrive_json_field "$META" "name")
  AUTHOR=$(echo "$META" | grep -o '"displayName"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/"displayName"[[:space:]]*:[[:space:]]*"//;s/"$//' || true)
fi

# --- Convert to markdown ---
CONTENT=""

if command -v markitdown &>/dev/null; then
  CONTENT=$(markitdown "$HTML_FILE" 2>/dev/null || true)
fi

if [ -z "$CONTENT" ]; then
  require_cmd pandoc "brew install pandoc"
  CONTENT=$(pandoc -f html -t markdown --wrap=none "$HTML_FILE" 2>/dev/null)
fi

if [ -z "$CONTENT" ]; then
  echo "Error: Failed to convert document to markdown" >&2
  exit 1
fi

# --- Extract title from content if not found via API ---
if [ -z "$TITLE" ]; then
  TITLE=$(grep -m1 '^#' <<< "$CONTENT" | sed 's/^##* *//' || true)
fi

if [ -z "$TITLE" ]; then
  TITLE="$DOC_ID"
fi

# --- Write output ---
OUT_FILE=$(output_path "$OUTPUT_DIR" "$TITLE" "$URL")
write_frontmatter "$OUT_FILE" "$TITLE" "$URL" "$AUTHOR"
echo "$CONTENT" >> "$OUT_FILE"

echo "$OUT_FILE"
