#!/usr/bin/env bats
# web.bats — integration tests for scripts/parsers/web.sh
# These tests make real HTTP requests to stable public URLs.

load test_helper

# ============================================================
# example.com — simplest possible web page (IANA-owned, never changes)
# ============================================================

@test "web.sh: fetches example.com successfully" {
  run bash "$SCRIPTS_DIR/parsers/web.sh" "https://example.com" "$TEST_OUTPUT_DIR"
  assert_success
  # Last line of output is the file path
  assert_output --regexp '\.md$'
}

@test "web.sh: example.com output has valid frontmatter" {
  local out
  out=$(bash "$SCRIPTS_DIR/parsers/web.sh" "https://example.com" "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_frontmatter_field "$out" "source" "https://example.com"
}

@test "web.sh: example.com output has markdown content" {
  local out
  out=$(bash "$SCRIPTS_DIR/parsers/web.sh" "https://example.com" "$TEST_OUTPUT_DIR")
  assert_has_content "$out" 3
  # example.com contains "Example Domain"
  run grep -i "example domain" "$out"
  assert_success
}

# ============================================================
# Python docs — complex page with code blocks, lists, cross-references
# ============================================================

@test "web.sh: fetches Python docs datastructures page" {
  run bash "$SCRIPTS_DIR/parsers/web.sh" "https://docs.python.org/3/tutorial/datastructures.html" "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "web.sh: Python docs output has substantial content" {
  local out
  out=$(bash "$SCRIPTS_DIR/parsers/web.sh" "https://docs.python.org/3/tutorial/datastructures.html" "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_has_content "$out" 50

  # Should contain Python-specific content
  run grep -i "list" "$out"
  assert_success
}

# ============================================================
# Wikipedia — tables, images, complex HTML
# ============================================================

@test "web.sh: fetches Wikipedia Markdown article" {
  run bash "$SCRIPTS_DIR/parsers/web.sh" "https://en.wikipedia.org/wiki/Markdown" "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "web.sh: Wikipedia output has valid structure" {
  local out
  out=$(bash "$SCRIPTS_DIR/parsers/web.sh" "https://en.wikipedia.org/wiki/Markdown" "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_has_content "$out" 20

  # Should mention John Gruber (Markdown creator)
  run grep -i "gruber" "$out"
  assert_success
}

# ============================================================
# Error cases
# ============================================================

@test "web.sh: fails on non-existent domain" {
  run bash "$SCRIPTS_DIR/parsers/web.sh" "https://this-domain-does-not-exist-xyz123.com" "$TEST_OUTPUT_DIR"
  assert_failure
}
