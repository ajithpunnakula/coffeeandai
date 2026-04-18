#!/usr/bin/env bats
# lib.bats — unit tests for scripts/lib.sh

load test_helper

# Source lib.sh for direct function testing
setup() {
  export TEST_OUTPUT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/wiki-fetch-test.XXXXXX")"
  source "$SCRIPTS_DIR/lib.sh"
}

# ============================================================
# slugify
# ============================================================

@test "slugify: converts spaces to hyphens" {
  run slugify "Hello World"
  assert_output "hello-world"
}

@test "slugify: lowercases text" {
  run slugify "ALLCAPS"
  assert_output "allcaps"
}

@test "slugify: replaces special characters" {
  run slugify "Hello, World! (2026)"
  assert_output "hello-world-2026"
}

@test "slugify: collapses multiple hyphens" {
  run slugify "too---many---hyphens"
  assert_output "too-many-hyphens"
}

@test "slugify: strips leading and trailing hyphens" {
  run slugify "  leading and trailing  "
  assert_output "leading-and-trailing"
}

@test "slugify: handles mixed special characters" {
  run slugify "AI & ML: A Guide [2026]"
  assert_output "ai-ml-a-guide-2026"
}

# ============================================================
# detect_type
# ============================================================

@test "detect_type: Google Docs URL" {
  run detect_type "https://docs.google.com/document/d/1abc123/edit"
  assert_output "gdoc"
}

@test "detect_type: Google Drive file URL" {
  run detect_type "https://drive.google.com/file/d/1abc123/view"
  assert_output "gdrive"
}

@test "detect_type: Google Drive folder URL" {
  run detect_type "https://drive.google.com/drive/folders/1abc123"
  assert_output "gdrive_folder"
}

@test "detect_type: PDF file extension" {
  run detect_type "paper.pdf"
  assert_output "pdf"
}

@test "detect_type: PDF URL" {
  run detect_type "https://example.com/document.pdf"
  assert_output "pdf"
}

@test "detect_type: video extensions" {
  run detect_type "lecture.mp4"
  assert_output "video"

  run detect_type "talk.mov"
  assert_output "video"

  run detect_type "demo.webm"
  assert_output "video"
}

@test "detect_type: audio extensions" {
  run detect_type "podcast.mp3"
  assert_output "video"

  run detect_type "recording.wav"
  assert_output "video"
}

@test "detect_type: HTTP URL defaults to web" {
  run detect_type "https://example.com/article"
  assert_output "web"
}

@test "detect_type: HTTPS URL defaults to web" {
  run detect_type "https://blog.example.com/post"
  assert_output "web"
}

# ============================================================
# today
# ============================================================

@test "today: returns ISO date format" {
  run today
  # Should match YYYY-MM-DD pattern
  assert_output --regexp '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
}

# ============================================================
# write_frontmatter
# ============================================================

@test "write_frontmatter: creates valid YAML frontmatter" {
  local file="$TEST_OUTPUT_DIR/test.md"
  write_frontmatter "$file" "Test Title" "https://example.com" "John Doe" "2026-01-15" "A test"

  assert_valid_frontmatter "$file"
  assert_frontmatter_field "$file" "title" "Test Title"
  assert_frontmatter_field "$file" "source" "https://example.com"
  assert_frontmatter_field "$file" "author" "John Doe"
  assert_frontmatter_field "$file" "description" "A test"
}

@test "write_frontmatter: handles empty optional fields" {
  local file="$TEST_OUTPUT_DIR/test.md"
  write_frontmatter "$file" "Title Only" "https://example.com"

  assert_valid_frontmatter "$file"
  assert_frontmatter_field "$file" "title" "Title Only"
  # tags should include clippings
  run grep "clippings" "$file"
  assert_success
}

@test "write_frontmatter: includes source_path when provided" {
  local file="$TEST_OUTPUT_DIR/test.md"
  write_frontmatter "$file" "Test" "https://example.com" "" "" "" "Company/Docs/test.pdf"

  assert_valid_frontmatter "$file"
  assert_frontmatter_field "$file" "source_path" "Company/Docs/test.pdf"
}

@test "write_frontmatter: omits source_path when empty" {
  local file="$TEST_OUTPUT_DIR/test.md"
  write_frontmatter "$file" "Test" "https://example.com"

  assert_valid_frontmatter "$file"
  # source_path line should not be present
  run grep "source_path" "$file"
  assert_failure
}

# ============================================================
# output_path
# ============================================================

@test "output_path: generates slugified path" {
  run output_path "$TEST_OUTPUT_DIR" "My Article Title"
  assert_output "$TEST_OUTPUT_DIR/my-article-title.md"
}

@test "output_path: deduplicates existing files" {
  # Create the first file
  touch "$TEST_OUTPUT_DIR/my-article.md"

  run output_path "$TEST_OUTPUT_DIR" "My Article"
  assert_output "$TEST_OUTPUT_DIR/my-article-2.md"
}

@test "output_path: increments past existing duplicates" {
  touch "$TEST_OUTPUT_DIR/my-article.md"
  touch "$TEST_OUTPUT_DIR/my-article-2.md"

  run output_path "$TEST_OUTPUT_DIR" "My Article"
  assert_output "$TEST_OUTPUT_DIR/my-article-3.md"
}

@test "output_path: uses URL parent segment on collision" {
  touch "$TEST_OUTPUT_DIR/quickstart.md"

  run output_path "$TEST_OUTPUT_DIR" "Quickstart" "https://code.claude.com/docs/en/agent-sdk/quickstart"
  assert_output "$TEST_OUTPUT_DIR/quickstart-agent-sdk.md"
}

@test "output_path: falls back to numeric when no URL provided" {
  touch "$TEST_OUTPUT_DIR/quickstart.md"

  run output_path "$TEST_OUTPUT_DIR" "Quickstart"
  assert_output "$TEST_OUTPUT_DIR/quickstart-2.md"
}

@test "output_path: falls back to numeric when URL suffix also collides" {
  touch "$TEST_OUTPUT_DIR/quickstart.md"
  touch "$TEST_OUTPUT_DIR/quickstart-agent-sdk.md"

  run output_path "$TEST_OUTPUT_DIR" "Quickstart" "https://code.claude.com/docs/en/agent-sdk/quickstart"
  assert_output "$TEST_OUTPUT_DIR/quickstart-2.md"
}

# ============================================================
# parse_args
# ============================================================

@test "parse_args: default output directory" {
  unset WIKI_FETCH_OUTPUT
  parse_args "https://example.com"
  assert_equal "$OUTPUT_DIR" "output/"
  assert_equal "${SOURCES[0]}" "https://example.com"
}

@test "parse_args: custom output directory with -o" {
  parse_args "https://example.com" -o "$TEST_OUTPUT_DIR"
  assert_equal "$OUTPUT_DIR" "$TEST_OUTPUT_DIR"
  assert_equal "${SOURCES[0]}" "https://example.com"
}

@test "parse_args: multiple sources" {
  parse_args "https://a.com" "https://b.com" -o "$TEST_OUTPUT_DIR"
  assert_equal "${#SOURCES[@]}" 2
  assert_equal "${SOURCES[0]}" "https://a.com"
  assert_equal "${SOURCES[1]}" "https://b.com"
}

# ============================================================
# resolve_url
# ============================================================

@test "resolve_url: resolves relative path" {
  run resolve_url "https://docs.example.com/en/docs/intro" "../guide"
  assert_output "https://docs.example.com/en/guide"
}

@test "resolve_url: absolute URL passes through" {
  run resolve_url "https://docs.example.com/en/docs/intro" "https://other.com/page"
  assert_output "https://other.com/page"
}

@test "resolve_url: resolves root-relative path" {
  run resolve_url "https://docs.example.com/en/docs/intro" "/about"
  assert_output "https://docs.example.com/about"
}

# ============================================================
# normalize_url
# ============================================================

@test "normalize_url: strips fragment" {
  run normalize_url "https://example.com/page#section"
  assert_output "https://example.com/page"
}

@test "normalize_url: strips trailing slash" {
  run normalize_url "https://example.com/page/"
  assert_output "https://example.com/page"
}

@test "normalize_url: preserves query params but strips fragment" {
  run normalize_url "https://example.com/page?v=1#top"
  assert_output "https://example.com/page?v=1"
}

@test "normalize_url: no-op on clean URL" {
  run normalize_url "https://example.com/page"
  assert_output "https://example.com/page"
}

# ============================================================
# detect_type_mime
# ============================================================

@test "detect_type_mime: PDF" {
  run detect_type_mime "application/pdf"
  assert_output "pdf"
}

@test "detect_type_mime: video types" {
  run detect_type_mime "video/mp4"
  assert_output "video"

  run detect_type_mime "audio/mpeg"
  assert_output "video"
}

@test "detect_type_mime: Google Docs native" {
  run detect_type_mime "application/vnd.google-apps.document"
  assert_output "gdoc"
}

@test "detect_type_mime: Google Slides exports as PDF" {
  run detect_type_mime "application/vnd.google-apps.presentation"
  assert_output "pdf"
}

@test "detect_type_mime: Google Drive folder" {
  run detect_type_mime "application/vnd.google-apps.folder"
  assert_output "folder"
}

@test "detect_type_mime: images are skipped" {
  run detect_type_mime "image/png"
  assert_output "skip"
}

@test "detect_type_mime: unknown type" {
  run detect_type_mime "application/octet-stream"
  assert_output "unknown"
}
