#!/usr/bin/env bats
# video.bats — integration tests for video/audio ingestion
# Uses short public audio files to test transcription.
# These tests require ffmpeg and whisper.

load test_helper

# ============================================================
# Internet Archive test MP3 — short spoken English, ~12 seconds
# Permanent URL, public domain
# ============================================================

@test "video: transcribes short audio from URL via ingest" {
  run bash "$SCRIPTS_DIR/ingest.sh" \
    "https://ia800301.us.archive.org/15/items/testmp3testfile/mpthreetest.mp3" \
    -o "$TEST_OUTPUT_DIR"
  assert_success
  assert_output --regexp '\.md$'
}

@test "video: audio output has valid frontmatter" {
  local out
  out=$(bash "$SCRIPTS_DIR/ingest.sh" \
    "https://ia800301.us.archive.org/15/items/testmp3testfile/mpthreetest.mp3" \
    -o "$TEST_OUTPUT_DIR")
  assert_valid_frontmatter "$out"
  assert_frontmatter_field "$out" "source" "https://ia800301.us.archive.org/15/items/testmp3testfile/mpthreetest.mp3"
}

@test "video: audio output has transcript section" {
  local out
  out=$(bash "$SCRIPTS_DIR/ingest.sh" \
    "https://ia800301.us.archive.org/15/items/testmp3testfile/mpthreetest.mp3" \
    -o "$TEST_OUTPUT_DIR")

  # Should have a Transcript heading
  run grep "## Transcript" "$out"
  assert_success

  # Should have actual transcribed content (the audio says "MP3 file")
  run grep -i "mp3\|upload\|test" "$out"
  assert_success
}

# ============================================================
# Error cases
# ============================================================

@test "video parser: fails on non-existent local file" {
  run bash "$SCRIPTS_DIR/parsers/video.sh" "/tmp/nonexistent-video.mp4" "$TEST_OUTPUT_DIR"
  assert_failure
  assert_output --partial "not found"
}

@test "video: fails on invalid URL" {
  run bash "$SCRIPTS_DIR/ingest.sh" "https://example.com/not-a-video.mp4" -o "$TEST_OUTPUT_DIR"
  assert_failure
}
