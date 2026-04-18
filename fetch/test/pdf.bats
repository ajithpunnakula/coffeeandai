#!/usr/bin/env bats
# pdf.bats — integration tests for PDF ingestion
# Uses real public PDFs that are stable and small.

load test_helper

# ============================================================
# IRS W-9 form — government PDF, .pdf extension in URL, very stable
# ============================================================

@test "pdf: fetches and converts IRS W-9 PDF via ingest" {
  run bash "$SCRIPTS_DIR/ingest.sh" "https://www.irs.gov/pub/irs-pdf/fw9.pdf" -o "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "pdf: IRS W-9 has valid frontmatter" {
  local out
  out=$(bash "$SCRIPTS_DIR/ingest.sh" "https://www.irs.gov/pub/irs-pdf/fw9.pdf" -o "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_frontmatter_field "$out" "source" "https://www.irs.gov/pub/irs-pdf/fw9.pdf"
}

@test "pdf: IRS W-9 has readable content" {
  local out
  out=$(bash "$SCRIPTS_DIR/ingest.sh" "https://www.irs.gov/pub/irs-pdf/fw9.pdf" -o "$TEST_OUTPUT_DIR")
  assert_has_content "$out" 10

  # Should contain tax-related content
  run grep -i "taxpayer" "$out"
  assert_success
}

# ============================================================
# Local PDF parser tests
# ============================================================

@test "pdf parser: converts downloaded PDF" {
  # Download arxiv paper to local file, then parse
  local pdf_file="$TEST_OUTPUT_DIR/paper.pdf"
  curl -sL -o "$pdf_file" "https://arxiv.org/pdf/1706.03762"

  run bash "$SCRIPTS_DIR/parsers/pdf.sh" "$pdf_file" "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "pdf parser: arxiv paper has substantial content" {
  local pdf_file="$TEST_OUTPUT_DIR/paper.pdf"
  curl -sL -o "$pdf_file" "https://arxiv.org/pdf/1706.03762"

  local out
  out=$(bash "$SCRIPTS_DIR/parsers/pdf.sh" "$pdf_file" "$TEST_OUTPUT_DIR")
  assert_has_content "$out" 50

  run grep -i "attention" "$out"
  assert_success
}

# ============================================================
# Error cases
# ============================================================

@test "pdf parser: fails on non-existent local file" {
  run bash "$SCRIPTS_DIR/parsers/pdf.sh" "/tmp/this-file-does-not-exist.pdf" "$TEST_OUTPUT_DIR"
  assert_failure
  assert_output --partial "not found"
}

@test "pdf: fails on invalid PDF URL via ingest" {
  run bash "$SCRIPTS_DIR/ingest.sh" "https://example.com/not-a-real.pdf" -o "$TEST_OUTPUT_DIR"
  assert_failure
}
