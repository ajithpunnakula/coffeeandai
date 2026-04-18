#!/usr/bin/env bash
# pdf.sh — Convert a local PDF file to markdown
# Requires: markitdown (pip install markitdown)
# Fallback: pdftotext (brew install poppler)
#
# Usage: bash scripts/parsers/pdf.sh <local-file> [output_dir] [source_url] [source_path]
#
# This parser accepts only local files. For URL downloads,
# use ingest.sh which handles download and routes to this parser.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../lib.sh"

setup_temp

LOCAL_FILE="$1"
OUTPUT_DIR="${2:-${WIKI_FETCH_OUTPUT:-output/}}"
SOURCE_URL="${3:-$LOCAL_FILE}"
SOURCE_PATH="${4:-}"
mkdir -p "$OUTPUT_DIR"

# --- Validate input ---
if [ -z "$LOCAL_FILE" ]; then
  echo "Error: No file provided" >&2
  echo "Usage: bash scripts/parsers/pdf.sh <local-file> [output_dir] [source_url] [source_path]" >&2
  exit 1
fi

if [ ! -f "$LOCAL_FILE" ]; then
  echo "Error: File not found: $LOCAL_FILE" >&2
  exit 1
fi

# --- Convert ---
CONTENT=""

if command -v markitdown &>/dev/null; then
  CONTENT=$(markitdown "$LOCAL_FILE" 2>/dev/null || true)
fi

if [ -z "$CONTENT" ]; then
  # Fallback: pdftotext
  require_cmd pdftotext "brew install poppler"
  CONTENT=$(pdftotext -layout "$LOCAL_FILE" - 2>/dev/null)
fi

if [ -z "$CONTENT" ]; then
  echo "Error: Failed to convert PDF to markdown" >&2
  exit 1
fi

# --- Extract metadata ---
TITLE=""
AUTHOR=""

if command -v pdfinfo &>/dev/null; then
  TITLE=$(pdfinfo "$LOCAL_FILE" 2>/dev/null | grep -i "^Title:" | sed 's/^Title:\s*//' | xargs)
  AUTHOR=$(pdfinfo "$LOCAL_FILE" 2>/dev/null | grep -i "^Author:" | sed 's/^Author:\s*//' | xargs)
fi

if [ -z "$TITLE" ]; then
  # Try first markdown heading
  TITLE=$(grep -m1 '^#' <<< "$CONTENT" | sed 's/^##* *//' || true)
fi

if [ -z "$TITLE" ]; then
  # Fallback: filename without extension
  TITLE=$(basename "$LOCAL_FILE" .pdf | sed 's/-/ /g;s/_/ /g')
fi

# --- Write output ---
OUT_FILE=$(output_path "$OUTPUT_DIR" "$TITLE" "$SOURCE_URL")
write_frontmatter "$OUT_FILE" "$TITLE" "$SOURCE_URL" "$AUTHOR" "" "" "$SOURCE_PATH"
echo "$CONTENT" >> "$OUT_FILE"

echo "$OUT_FILE"
