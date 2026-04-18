#!/usr/bin/env bash
# test_helper.bash — shared setup for all bats tests

# Load bats libraries
load 'libs/bats-support/load'
load 'libs/bats-assert/load'
load 'libs/bats-file/load'

# Project root (one level up from test/)
export PROJECT_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/.." && pwd)"
export SCRIPTS_DIR="$PROJECT_ROOT/scripts"

# Each test gets its own temp output directory, cleaned up automatically
setup() {
  export TEST_OUTPUT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/wiki-fetch-test.XXXXXX")"
}

teardown() {
  rm -rf "$TEST_OUTPUT_DIR"
}

# --- Assertion helpers ---

# Assert that a file has valid YAML frontmatter (starts with ---, ends with ---)
assert_valid_frontmatter() {
  local file="$1"
  assert_file_exists "$file"

  # First line must be ---
  local first_line
  first_line=$(head -1 "$file")
  assert_equal "$first_line" "---"

  # Must have a closing ---
  local closing
  closing=$(awk 'NR>1 && /^---$/{print NR; exit}' "$file")
  assert [ -n "$closing" ]
}

# Assert that frontmatter contains a specific field with expected value
assert_frontmatter_field() {
  local file="$1"
  local field="$2"
  local expected="$3"

  local value
  value=$(awk 'NR==1{next} /^---$/{exit} {print}' "$file" | grep "^${field}:" | head -1 | sed "s/^${field}:[[:space:]]*//" | sed 's/^"//;s/"$//')

  if [ -n "$expected" ]; then
    assert_equal "$value" "$expected"
  else
    # Just assert the field exists
    assert [ -n "$value" ]
  fi
}

# Assert that file has markdown content after frontmatter
assert_has_content() {
  local file="$1"
  local min_lines="${2:-5}"

  # Count lines after frontmatter
  local total_lines
  total_lines=$(wc -l < "$file" | tr -d ' ')
  local frontmatter_end
  frontmatter_end=$(awk 'NR>1 && /^---$/{print NR; exit}' "$file")

  local content_lines=$((total_lines - frontmatter_end))
  assert [ "$content_lines" -ge "$min_lines" ]
}
