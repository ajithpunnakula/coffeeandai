#!/usr/bin/env bash
# lib.sh — shared utilities for wiki-fetch adapters
# Source this file from adapter scripts: source "$(dirname "$0")/lib.sh"

set -euo pipefail

# --- Slug generation ---
# Convert a string to a filesystem-safe slug
# Usage: slugify "My Article Title" -> my-article-title
slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/-/g' \
    | sed 's/--*/-/g' \
    | sed 's/^-//;s/-$//'
}

# --- Date formatting ---
# Today's date in ISO format
today() {
  date +%Y-%m-%d
}

# --- Frontmatter generation ---
# Write YAML frontmatter to a file
# Usage: write_frontmatter output.md "Title" "https://source" "Author" "2026-01-15" "Description" "path/in/source"
write_frontmatter() {
  local file="$1"
  local title="$2"
  local source="${3:-}"
  local author="${4:-}"
  local published="${5:-}"
  local description="${6:-}"
  local source_path="${7:-}"

  cat > "$file" <<EOF
---
title: "$title"
source: "$source"
author: "$author"
published: $published
created: $(today)
description: "$description"
$(if [ -n "$source_path" ]; then echo "source_path: \"$source_path\""; fi)
tags:
  - "clippings"
---

EOF
}

# --- Source type detection ---
# Detect the source type from a URL or file path
# Usage: detect_type "https://docs.google.com/document/d/abc/edit" -> gdoc
detect_type() {
  local source="$1"

  case "$source" in
    *docs.google.com/document*)
      echo "gdoc" ;;
    *docs.google.com/videos/d/*)
      echo "gdrive" ;;
    *drive.google.com/file*|*drive.google.com/open*)
      echo "gdrive" ;;
    *drive.google.com/drive/folders/*)
      echo "gdrive_folder" ;;
    *.pdf)
      echo "pdf" ;;
    *.mp4|*.mov|*.avi|*.mkv|*.webm)
      echo "video" ;;
    *.mp3|*.wav|*.m4a)
      echo "video" ;;
    http://*|https://*)
      echo "web" ;;
    *)
      # Local file — check extension
      if file -b --mime-type "$source" 2>/dev/null | grep -q "application/pdf"; then
        echo "pdf"
      elif file -b --mime-type "$source" 2>/dev/null | grep -q "video/"; then
        echo "video"
      elif file -b --mime-type "$source" 2>/dev/null | grep -q "audio/"; then
        echo "video"
      else
        echo "unknown"
      fi
      ;;
  esac
}

# --- Output path generation ---
# Generate output file path from title and output directory
# Usage: output_path "output/" "My Article Title" ["https://example.com/section/page"]
# On collision, appends parent path segment from URL (e.g., quickstart-agent-sdk.md)
# Falls back to numeric suffix if no URL or path suffix also collides
output_path() {
  local output_dir="$1"
  local title="$2"
  local source_url="${3:-}"
  local slug
  slug=$(slugify "$title")

  local path="${output_dir%/}/${slug}.md"
  if [ -f "$path" ]; then
    # Try URL-path-based suffix first (parent directory segment)
    if [ -n "$source_url" ]; then
      local url_path
      url_path=$(echo "$source_url" | sed 's|https\?://[^/]*||;s|/$||')
      # Get parent segment: /docs/en/agent-sdk/quickstart -> agent-sdk
      local parent
      parent=$(echo "$url_path" | sed 's|/[^/]*$||;s|.*/||')
      if [ -n "$parent" ] && [ "$parent" != "$slug" ]; then
        local suffixed="${output_dir%/}/${slug}-${parent}.md"
        if [ ! -f "$suffixed" ]; then
          echo "$suffixed"
          return
        fi
      fi
    fi
    # Fall back to numeric suffix
    local i=2
    while [ -f "${output_dir%/}/${slug}-${i}.md" ]; do
      i=$((i + 1))
    done
    path="${output_dir%/}/${slug}-${i}.md"
  fi

  echo "$path"
}

# --- Temp directory ---
# Create a temp dir that gets cleaned up on exit
# Usage: setup_temp -> sets WIKI_FETCH_TEMP
setup_temp() {
  WIKI_FETCH_TEMP=$(mktemp -d "${TMPDIR:-/tmp}/wiki-fetch.XXXXXX")
  trap 'rm -rf "$WIKI_FETCH_TEMP"' EXIT
}

# --- Dependency check ---
# Check if a command exists
# Usage: require_cmd markitdown "pip install markitdown"
require_cmd() {
  local cmd="$1"
  local install_hint="${2:-}"
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is not installed." >&2
    if [ -n "$install_hint" ]; then
      echo "Install: $install_hint" >&2
    fi
    exit 1
  fi
}

# --- URL utilities ---
# Resolve a relative URL against a base URL
# Usage: resolve_url "https://example.com/docs/intro" "../guide"
resolve_url() {
  python3 -c "from urllib.parse import urljoin; print(urljoin('$1', '$2'))"
}

# Normalize a URL for deduplication (strip fragment, trailing slash)
# Usage: normalize_url "https://example.com/page/#section" -> "https://example.com/page"
normalize_url() {
  python3 -c "
from urllib.parse import urlparse, urlunparse
u = urlparse('$1')
path = u.path.rstrip('/')
print(urlunparse(u._replace(fragment='', path=path)))
"
}

# --- Parse output dir from args ---
# Looks for -o <dir> in arguments, returns the dir and remaining args
# Usage: parse_output_dir "$@"
#   Sets: OUTPUT_DIR, SOURCES (array)
parse_args() {
  OUTPUT_DIR="${WIKI_FETCH_OUTPUT:-output/}"
  SOURCES=()

  while [ $# -gt 0 ]; do
    case "$1" in
      -o|--output)
        OUTPUT_DIR="$2"
        shift 2
        ;;
      *)
        SOURCES+=("$1")
        shift
        ;;
    esac
  done

  # Ensure output dir exists
  mkdir -p "$OUTPUT_DIR"
}

# --- MIME type to parser mapping ---
# Map a MIME type to the appropriate parser name
# Usage: detect_type_mime "video/mp4" -> video
detect_type_mime() {
  local mime="$1"

  case "$mime" in
    application/pdf)
      echo "pdf" ;;
    video/*|audio/*)
      echo "video" ;;
    application/vnd.google-apps.document)
      echo "gdoc" ;;
    application/vnd.google-apps.presentation)
      echo "pdf" ;;  # export as PDF, then parse
    application/vnd.google-apps.spreadsheet)
      echo "web" ;;  # export as HTML, then parse
    application/vnd.google-apps.folder)
      echo "folder" ;;
    application/vnd.openxmlformats-officedocument.*)
      echo "docx" ;;  # markitdown handles docx/pptx/xlsx
    text/html)
      echo "web" ;;
    text/plain|text/markdown)
      echo "text" ;;
    image/*)
      echo "skip" ;;
    *)
      echo "unknown" ;;
  esac
}
