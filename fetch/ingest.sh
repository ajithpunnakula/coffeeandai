#!/usr/bin/env bash
# ingest.sh — Single-file orchestrator: detect source, download if needed, route to parser
#
# Usage: bash scripts/ingest.sh <url-or-path> [-o output_dir]
#
# Handles:
#   - Google Drive files (downloads via API, detects type from MIME)
#   - Google Docs (routes to gdoc parser)
#   - Web URLs (routes to web parser)
#   - PDF URLs (downloads, routes to pdf parser)
#   - Local files (detects type, routes to parser)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib.sh"
source "$SCRIPT_DIR/sources/gdrive.sh"

setup_temp

# --- Parse arguments ---
parse_args "$@"

if [ ${#SOURCES[@]} -eq 0 ]; then
  echo "Error: No source URL or file path provided" >&2
  echo "Usage: bash scripts/ingest.sh <url-or-path> [-o output_dir]" >&2
  exit 1
fi

SOURCE="${SOURCES[0]}"

# --- Detect source type ---
SOURCE_TYPE=$(detect_type "$SOURCE")

case "$SOURCE_TYPE" in

  gdrive)
    # Google Drive file — download and detect content type from metadata
    FILE_ID=$(gdrive_extract_id "$SOURCE")
    if [ -z "$FILE_ID" ]; then
      echo "Error: Could not extract file ID from: $SOURCE" >&2
      exit 1
    fi

    ACCESS_TOKEN=$(gdrive_auth_token) || exit 1
    META=$(gdrive_metadata "$FILE_ID" "$ACCESS_TOKEN")

    FILENAME=$(gdrive_json_field "$META" "name")
    MIME_TYPE=$(gdrive_json_field "$META" "mimeType")
    FILENAME="${FILENAME:-unknown}"
    MIME_TYPE="${MIME_TYPE:-application/octet-stream}"

    echo "File: $FILENAME ($MIME_TYPE)" >&2

    # Resolve the folder path for source_path metadata
    SOURCE_PATH=$(gdrive_resolve_path "$FILE_ID" "$ACCESS_TOKEN" 2>/dev/null || echo "$FILENAME")

    # Map MIME type to parser
    PARSER_TYPE=$(detect_type_mime "$MIME_TYPE")

    case "$PARSER_TYPE" in
      video)
        LOCAL_FILE="$WIKI_FETCH_TEMP/$FILENAME"
        echo "Downloading from Google Drive..." >&2
        gdrive_download "$FILE_ID" "$LOCAL_FILE" "$ACCESS_TOKEN" || exit 1
        echo "Transcribing..." >&2
        bash "$SCRIPT_DIR/parsers/video.sh" "$LOCAL_FILE" "$OUTPUT_DIR" "$SOURCE" "$SOURCE_PATH"
        ;;
      pdf)
        # Could be a native Google Slides (export as PDF) or an actual PDF
        if [ "$MIME_TYPE" = "application/vnd.google-apps.presentation" ]; then
          # Export Google Slides as PDF
          LOCAL_FILE="$WIKI_FETCH_TEMP/${FILENAME%.pptx}.pdf"
          echo "Exporting presentation as PDF..." >&2
          curl -sL -o "$LOCAL_FILE" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            "https://www.googleapis.com/drive/v3/files/${FILE_ID}/export?mimeType=application/pdf"
        else
          LOCAL_FILE="$WIKI_FETCH_TEMP/$FILENAME"
          echo "Downloading from Google Drive..." >&2
          gdrive_download "$FILE_ID" "$LOCAL_FILE" "$ACCESS_TOKEN" || exit 1
        fi
        bash "$SCRIPT_DIR/parsers/pdf.sh" "$LOCAL_FILE" "$OUTPUT_DIR" "$SOURCE" "$SOURCE_PATH"
        ;;
      gdoc)
        # Google-native document — route to gdoc parser with original URL
        bash "$SCRIPT_DIR/parsers/gdoc.sh" "$SOURCE" "$OUTPUT_DIR"
        ;;
      web)
        # HTML or Sheets — export as HTML and use web parser
        if [ "$MIME_TYPE" = "application/vnd.google-apps.spreadsheet" ]; then
          LOCAL_FILE="$WIKI_FETCH_TEMP/${FILENAME}.html"
          curl -sL -o "$LOCAL_FILE" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            "https://www.googleapis.com/drive/v3/files/${FILE_ID}/export?mimeType=text/html"
          bash "$SCRIPT_DIR/parsers/web.sh" "file://$LOCAL_FILE" "$OUTPUT_DIR"
        else
          LOCAL_FILE="$WIKI_FETCH_TEMP/$FILENAME"
          gdrive_download "$FILE_ID" "$LOCAL_FILE" "$ACCESS_TOKEN" || exit 1
          bash "$SCRIPT_DIR/parsers/web.sh" "file://$LOCAL_FILE" "$OUTPUT_DIR"
        fi
        ;;
      skip)
        echo "Skipping unsupported file type: $FILENAME ($MIME_TYPE)" >&2
        exit 0
        ;;
      *)
        # Try downloading and using markitdown as a generic fallback
        LOCAL_FILE="$WIKI_FETCH_TEMP/$FILENAME"
        echo "Downloading from Google Drive..." >&2
        gdrive_download "$FILE_ID" "$LOCAL_FILE" "$ACCESS_TOKEN" || exit 1
        echo "Warning: No dedicated parser for MIME type '$MIME_TYPE', trying markitdown..." >&2
        if command -v markitdown &>/dev/null; then
          CONTENT=$(markitdown "$LOCAL_FILE" 2>/dev/null || true)
          if [ -n "$CONTENT" ]; then
            TITLE=$(basename "$FILENAME" | sed 's/\.[^.]*$//;s/-/ /g;s/_/ /g')
            OUT_FILE=$(output_path "$OUTPUT_DIR" "$TITLE" "$SOURCE")
            write_frontmatter "$OUT_FILE" "$TITLE" "$SOURCE" "" "" "" "$SOURCE_PATH"
            echo "$CONTENT" >> "$OUT_FILE"
            echo "$OUT_FILE"
            exit 0
          fi
        fi
        echo "Error: Could not parse $FILENAME ($MIME_TYPE)" >&2
        exit 1
        ;;
    esac
    ;;

  gdoc)
    bash "$SCRIPT_DIR/parsers/gdoc.sh" "$SOURCE" "$OUTPUT_DIR"
    ;;

  pdf)
    if [[ "$SOURCE" == http://* ]] || [[ "$SOURCE" == https://* ]]; then
      # Download PDF from URL first
      LOCAL_FILE="$WIKI_FETCH_TEMP/document.pdf"
      require_cmd curl
      curl -sL -o "$LOCAL_FILE" "$SOURCE"
      if [ ! -s "$LOCAL_FILE" ]; then
        echo "Error: Failed to download $SOURCE" >&2
        exit 1
      fi
      bash "$SCRIPT_DIR/parsers/pdf.sh" "$LOCAL_FILE" "$OUTPUT_DIR" "$SOURCE"
    else
      bash "$SCRIPT_DIR/parsers/pdf.sh" "$SOURCE" "$OUTPUT_DIR" "$SOURCE"
    fi
    ;;

  video)
    if [[ "$SOURCE" == http://* ]] || [[ "$SOURCE" == https://* ]]; then
      # Download media from URL first
      require_cmd curl
      EXT=$(echo "$SOURCE" | sed 's|.*\(\.[a-z0-9]*\)$|\1|')
      LOCAL_FILE="$WIKI_FETCH_TEMP/media${EXT}"
      curl -sL -o "$LOCAL_FILE" "$SOURCE"
      if [ ! -s "$LOCAL_FILE" ]; then
        echo "Error: Failed to download $SOURCE" >&2
        exit 1
      fi
      bash "$SCRIPT_DIR/parsers/video.sh" "$LOCAL_FILE" "$OUTPUT_DIR" "$SOURCE"
    else
      bash "$SCRIPT_DIR/parsers/video.sh" "$SOURCE" "$OUTPUT_DIR" "$SOURCE"
    fi
    ;;

  web)
    bash "$SCRIPT_DIR/parsers/web.sh" "$SOURCE" "$OUTPUT_DIR"
    ;;

  *)
    # Local file — try to detect by MIME type
    if [ -f "$SOURCE" ]; then
      MIME_TYPE=$(file -b --mime-type "$SOURCE" 2>/dev/null || echo "unknown")
      PARSER_TYPE=$(detect_type_mime "$MIME_TYPE")
      case "$PARSER_TYPE" in
        pdf)    bash "$SCRIPT_DIR/parsers/pdf.sh" "$SOURCE" "$OUTPUT_DIR" "$SOURCE" ;;
        video)  bash "$SCRIPT_DIR/parsers/video.sh" "$SOURCE" "$OUTPUT_DIR" "$SOURCE" ;;
        *)
          echo "Error: Unknown file type for $SOURCE (MIME: $MIME_TYPE)" >&2
          exit 1
          ;;
      esac
    else
      echo "Error: Cannot determine how to process: $SOURCE" >&2
      exit 1
    fi
    ;;
esac
