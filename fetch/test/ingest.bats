#!/usr/bin/env bats
# ingest.bats — tests for the ingest orchestrator
# Tests type detection routing and web URL ingestion.
# Google Drive tests require gcloud auth.

load test_helper

# ============================================================
# Web URL routing — ingest should route to web parser
# ============================================================

@test "ingest: routes web URL to web parser" {
  run bash "$SCRIPTS_DIR/ingest.sh" "https://example.com" -o "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "ingest: web output has valid frontmatter" {
  local out
  out=$(bash "$SCRIPTS_DIR/ingest.sh" "https://example.com" -o "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_frontmatter_field "$out" "source" "https://example.com"
}

# ============================================================
# Google Docs routing — ingest should route to gdoc parser
# ============================================================

@test "ingest: routes Google Doc URL to gdoc parser" {
  run bash "$SCRIPTS_DIR/ingest.sh" \
    "https://docs.google.com/document/d/1HHy_zPLGqJj0bHMiWPzPCxn1pO5GlOYwmv-qGgl4f_s/edit" \
    -o "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

# ============================================================
# PDF URL routing — ingest should download and route to pdf parser
# ============================================================

@test "ingest: routes PDF URL to pdf parser" {
  run bash "$SCRIPTS_DIR/ingest.sh" "https://www.irs.gov/pub/irs-pdf/fw9.pdf" -o "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

# ============================================================
# Error cases
# ============================================================

@test "ingest: fails with no arguments" {
  run bash "$SCRIPTS_DIR/ingest.sh"
  assert_failure
  assert_output --partial "No source"
}

@test "ingest: fails on unknown local file" {
  run bash "$SCRIPTS_DIR/ingest.sh" "/tmp/nonexistent-file.xyz" -o "$TEST_OUTPUT_DIR"
  assert_failure
}
