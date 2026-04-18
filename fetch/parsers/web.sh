#!/usr/bin/env bash
# web.sh — Fetch a web page and convert to markdown
# Requires: markitdown (pip install markitdown)
# Fallback: curl + pandoc (brew install pandoc)
#
# Usage: bash scripts/parsers/web.sh <url> [output_dir]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../lib.sh"

setup_temp

URL="$1"
OUTPUT_DIR="${2:-${WIKI_FETCH_OUTPUT:-output/}}"
mkdir -p "$OUTPUT_DIR"

# --- Convert ---
CONTENT=""

if command -v markitdown &>/dev/null; then
  CONTENT=$(markitdown "$URL" 2>/dev/null || true)
fi

if [ -z "$CONTENT" ]; then
  # Fallback: curl + pandoc
  require_cmd curl
  require_cmd pandoc "brew install pandoc"

  HTML_FILE="$WIKI_FETCH_TEMP/page.html"
  curl -sL -A "Mozilla/5.0 wiki-fetch/1.0" -o "$HTML_FILE" "$URL"

  if [ ! -s "$HTML_FILE" ]; then
    echo "Error: Failed to download $URL" >&2
    exit 1
  fi

  CONTENT=$(pandoc -f html -t markdown --wrap=none "$HTML_FILE" 2>/dev/null)
fi

if [ -z "$CONTENT" ]; then
  echo "Error: Failed to convert $URL to markdown" >&2
  exit 1
fi

# --- Extract title ---
# Try first markdown heading (use <<< to avoid SIGPIPE on large content)
TITLE=$(grep -m1 '^#' <<< "$CONTENT" | sed 's/^##* *//' || true)

if [ -z "$TITLE" ]; then
  # Fallback: use URL path as title
  TITLE=$(echo "$URL" | sed 's|.*/||;s|\.html\?$||;s|-| |g;s|_| |g')
fi

# --- Write output ---
OUT_FILE=$(output_path "$OUTPUT_DIR" "$TITLE" "$URL")
write_frontmatter "$OUT_FILE" "$TITLE" "$URL"
echo "$CONTENT" >> "$OUT_FILE"

echo "$OUT_FILE"
