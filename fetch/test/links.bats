#!/usr/bin/env bats
# links.bats — tests for link extraction from web pages

load test_helper

# ============================================================
# example.com — simple page with known link(s)
# ============================================================

@test "links.sh: extracts links from example.com" {
  run bash "$SCRIPTS_DIR/links.sh" "https://example.com"
  assert_success
  # example.com has a link to iana.org
  assert_output --partial "iana.org"
}

@test "links.sh: output is TSV with url and text" {
  run bash "$SCRIPTS_DIR/links.sh" "https://example.com"
  assert_success
  # Each line should have a tab separator
  local first_line
  first_line=$(echo "$output" | head -1)
  [[ "$first_line" == *$'\t'* ]]
}

# ============================================================
# Python docs — many links, relative and absolute
# ============================================================

@test "links.sh: extracts multiple links from Python docs" {
  run bash "$SCRIPTS_DIR/links.sh" "https://docs.python.org/3/tutorial/datastructures.html"
  assert_success
  # Should find multiple links
  local count
  count=$(echo "$output" | wc -l | tr -d ' ')
  [ "$count" -ge 10 ]
}

@test "links.sh: resolves relative URLs to absolute" {
  run bash "$SCRIPTS_DIR/links.sh" "https://docs.python.org/3/tutorial/datastructures.html"
  assert_success
  # All URLs should be absolute (start with http)
  while IFS=$'\t' read -r url text; do
    [[ "$url" == http* ]] || fail "Non-absolute URL found: $url"
  done <<< "$output"
}

# ============================================================
# Filtering
# ============================================================

@test "links.sh: excludes javascript and mailto links" {
  run bash "$SCRIPTS_DIR/links.sh" "https://docs.python.org/3/tutorial/datastructures.html"
  assert_success
  refute_output --partial "javascript:"
  refute_output --partial "mailto:"
}

@test "links.sh: deduplicates URLs" {
  run bash "$SCRIPTS_DIR/links.sh" "https://docs.python.org/3/tutorial/datastructures.html"
  assert_success
  local total
  total=$(echo "$output" | cut -f1 | wc -l | tr -d ' ')
  local unique
  unique=$(echo "$output" | cut -f1 | sort -u | wc -l | tr -d ' ')
  assert_equal "$total" "$unique"
}

# ============================================================
# Error cases
# ============================================================

# ============================================================
# Redirect handling — resolve links against final URL, not original
# ============================================================

@test "links.sh: resolves links against final URL after redirects" {
  # docs.anthropic.com/en/docs/claude-code/overview redirects to code.claude.com/docs/en/overview
  run bash "$SCRIPTS_DIR/links.sh" "https://docs.anthropic.com/en/docs/claude-code/overview"
  assert_success
  # Links should be resolved against code.claude.com (the final URL), not docs.anthropic.com
  assert_output --partial "code.claude.com"
  refute_output --partial "docs.anthropic.com/docs/en/"
}

# ============================================================
# Error cases
# ============================================================

@test "links.sh: fails on non-existent domain" {
  run bash "$SCRIPTS_DIR/links.sh" "https://this-domain-does-not-exist-xyz123.com"
  assert_failure
}

@test "links.sh: fails with no arguments" {
  run bash "$SCRIPTS_DIR/links.sh"
  assert_failure
}
