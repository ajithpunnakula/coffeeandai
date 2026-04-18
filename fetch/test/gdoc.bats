#!/usr/bin/env bats
# gdoc.bats — integration tests for scripts/parsers/gdoc.sh
# Uses publicly shared Google Docs (no auth required).

load test_helper

# ============================================================
# Angular Template Syntax Design Doc — public Google design doc
# Stable, authored by misko@google.com, has headings/lists/tables
# ============================================================

ANGULAR_DOC="https://docs.google.com/document/d/1HHy_zPLGqJj0bHMiWPzPCxn1pO5GlOYwmv-qGgl4f_s/edit"

@test "gdoc.sh: fetches public Google Doc successfully" {
  run bash "$SCRIPTS_DIR/parsers/gdoc.sh" "$ANGULAR_DOC" "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "gdoc.sh: output has valid frontmatter" {
  local out
  out=$(bash "$SCRIPTS_DIR/parsers/gdoc.sh" "$ANGULAR_DOC" "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_frontmatter_field "$out" "source" "$ANGULAR_DOC"
}

@test "gdoc.sh: output has substantial content" {
  local out
  out=$(bash "$SCRIPTS_DIR/parsers/gdoc.sh" "$ANGULAR_DOC" "$TEST_OUTPUT_DIR")
  assert_has_content "$out" 50

  # Should contain Angular-specific content
  run grep -i "angular\|template\|syntax" "$out"
  assert_success
}

# ============================================================
# Error cases
# ============================================================

@test "gdoc.sh: fails on invalid Google Doc URL" {
  run bash "$SCRIPTS_DIR/parsers/gdoc.sh" "https://example.com/not-a-doc" "$TEST_OUTPUT_DIR"
  assert_failure
  assert_output --partial "Could not extract document ID"
}

@test "gdoc.sh: fails on non-existent document ID" {
  run bash "$SCRIPTS_DIR/parsers/gdoc.sh" "https://docs.google.com/document/d/nonexistent_doc_id_12345/edit" "$TEST_OUTPUT_DIR"
  assert_failure
}
