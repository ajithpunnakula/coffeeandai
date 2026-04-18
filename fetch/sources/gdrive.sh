#!/usr/bin/env bash
# gdrive.sh — Google Drive source: auth, metadata, download, path resolution
# Requires: gcloud CLI (https://cloud.google.com/sdk/docs/install)
#
# Source this file to use its functions:
#   source "$(dirname "$0")/../sources/gdrive.sh"
#
# Auth: gcloud auth application-default login

# --- Auth ---
# Default service account key location
WIKI_FETCH_SA_KEY="${WIKI_FETCH_SA_KEY:-$HOME/.config/wiki-fetch/service-account.json}"

# Get a Bearer token via service account key (preferred) or gcloud fallback
# Usage: gdrive_auth_token -> prints token, exits 1 on failure
gdrive_auth_token() {
  local token

  # Try service account key first
  if [ -f "$WIKI_FETCH_SA_KEY" ]; then
    token=$(python3 -c "
from google.oauth2 import service_account
import json

creds = service_account.Credentials.from_service_account_file(
    '$WIKI_FETCH_SA_KEY',
    scopes=['https://www.googleapis.com/auth/drive.readonly']
)
creds.refresh(__import__('google.auth.transport.requests', fromlist=['Request']).Request())
print(creds.token)
" 2>/dev/null)
    if [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
    echo "Error: Service account key found at $WIKI_FETCH_SA_KEY but could not get token." >&2
    echo "Ensure google-auth is installed: pip install google-auth" >&2
    return 1
  fi

  # Fall back to gcloud
  if command -v gcloud &>/dev/null; then
    token=$(gcloud auth application-default print-access-token 2>/dev/null)
    if [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
    echo "Error: Could not get access token. Run: gcloud auth application-default login" >&2
    return 1
  fi

  echo "Error: No auth method available." >&2
  echo "Either place a service account key at $WIKI_FETCH_SA_KEY" >&2
  echo "or install gcloud CLI and run: gcloud auth application-default login" >&2
  return 1
}

# --- Extract ID ---
# Extract a file or document ID from various Google Drive/Docs URL formats
# Usage: gdrive_extract_id "https://drive.google.com/file/d/ABC123/view" -> ABC123
gdrive_extract_id() {
  local url="$1"

  # Google Docs URL
  if [[ "$url" == *docs.google.com/document/d/* ]]; then
    echo "$url" | sed -n 's|.*docs.google.com/document/d/\([^/]*\).*|\1|p'
    return
  fi

  # Google Sheets URL
  if [[ "$url" == *docs.google.com/spreadsheets/d/* ]]; then
    echo "$url" | sed -n 's|.*docs.google.com/spreadsheets/d/\([^/]*\).*|\1|p'
    return
  fi

  # Google Slides URL
  if [[ "$url" == *docs.google.com/presentation/d/* ]]; then
    echo "$url" | sed -n 's|.*docs.google.com/presentation/d/\([^/]*\).*|\1|p'
    return
  fi

  # Google Vids URL
  if [[ "$url" == *docs.google.com/videos/d/* ]]; then
    echo "$url" | sed -n 's|.*docs.google.com/videos/d/\([^/]*\).*|\1|p'
    return
  fi

  # Google Drive file URL
  if [[ "$url" == *drive.google.com/file/d/* ]]; then
    echo "$url" | sed -n 's|.*drive.google.com/file/d/\([^/]*\).*|\1|p'
    return
  fi

  # Google Drive folder URL
  if [[ "$url" == *drive.google.com/drive/folders/* ]]; then
    echo "$url" | sed -n 's|.*drive.google.com/drive/folders/\([^/?]*\).*|\1|p'
    return
  fi

  # Google Drive open URL (drive.google.com/open?id=...)
  if [[ "$url" == *drive.google.com*id=* ]]; then
    echo "$url" | sed -n 's|.*[?&]id=\([^&]*\).*|\1|p'
    return
  fi

  # If it doesn't match any pattern, assume it's a raw ID
  echo "$url"
}

# --- Metadata ---
# Fetch file metadata from Google Drive API
# Usage: gdrive_metadata <file_id> [access_token]
# Outputs JSON with name, mimeType, parents
gdrive_metadata() {
  local file_id="$1"
  local token="${2:-}"

  if [ -z "$token" ]; then
    token=$(gdrive_auth_token) || return 1
  fi

  curl -s \
    -H "Authorization: Bearer $token" \
    "https://www.googleapis.com/drive/v3/files/${file_id}?fields=name,mimeType,parents,owners"
}

# --- Download ---
# Download a file from Google Drive to a local path
# Usage: gdrive_download <file_id> <dest_path> [access_token]
gdrive_download() {
  local file_id="$1"
  local dest_path="$2"
  local token="${3:-}"

  if [ -z "$token" ]; then
    token=$(gdrive_auth_token) || return 1
  fi

  curl -sL -o "$dest_path" \
    -H "Authorization: Bearer $token" \
    "https://www.googleapis.com/drive/v3/files/${file_id}?alt=media"

  if [ ! -s "$dest_path" ]; then
    echo "Error: Failed to download file $file_id from Google Drive" >&2
    return 1
  fi
}

# --- Resolve path ---
# Resolve the full folder path of a file in Google Drive
# Usage: gdrive_resolve_path <file_id> [access_token]
# Outputs: "Folder/Subfolder/filename.ext"
gdrive_resolve_path() {
  local file_id="$1"
  local token="${2:-}"

  if [ -z "$token" ]; then
    token=$(gdrive_auth_token) || return 1
  fi

  local parts=()
  local current_id="$file_id"

  # Walk up the parent chain (max 20 levels to avoid infinite loops)
  local i=0
  while [ $i -lt 20 ]; do
    local meta
    meta=$(curl -s \
      -H "Authorization: Bearer $token" \
      "https://www.googleapis.com/drive/v3/files/${current_id}?fields=name,parents")

    local name
    name=$(echo "$meta" | grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"name"[[:space:]]*:[[:space:]]*"//;s/"$//')

    if [ -z "$name" ]; then
      break
    fi

    parts=("$name" "${parts[@]}")

    # Get parent ID
    local parent_id
    parent_id=$(echo "$meta" | grep -o '"parents"[[:space:]]*:[[:space:]]*\[[[:space:]]*"[^"]*"' | sed 's/.*"parents"[[:space:]]*:[[:space:]]*\[[[:space:]]*"//;s/"$//')

    if [ -z "$parent_id" ]; then
      break
    fi

    current_id="$parent_id"
    i=$((i + 1))
  done

  # Join with /
  local IFS="/"
  echo "${parts[*]}"
}

# --- Helper: extract fields from metadata JSON ---
# Usage: gdrive_json_field <json> <field_name>
gdrive_json_field() {
  local json="$1"
  local field="$2"
  echo "$json" | grep -o "\"${field}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed "s/\"${field}\"[[:space:]]*:[[:space:]]*\"//;s/\"$//"
}
