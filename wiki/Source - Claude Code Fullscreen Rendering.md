---
title: "Source - Claude Code Fullscreen Rendering"
type: source
date: 2026-04-13
source_file: "raw/fullscreen-rendering.md"
tags: [claude-code, features]
---

# Source - Claude Code Fullscreen Rendering

[[Claude Code]]'s fullscreen rendering mode is an opt-in terminal display mode that eliminates the flickering common in standard terminal output by drawing on the alternate screen buffer. Enabled by setting the environment variable `CLAUDE_CODE_NO_FLICKER=1`, it provides a more stable visual experience for long sessions. This mode requires [[Claude Code]] v2.1.89 or later.

The alternate screen buffer approach also unlocks mouse support within the terminal interface: users can click to expand collapsed sections, click URLs to open them, select text with the mouse, and scroll through output. These interactions are not available in the default rendering mode, which relies on standard terminal scrollback.

A transcript mode accessible via `Ctrl+O` provides a searchable, paginated view of the conversation history, useful for reviewing earlier exchanges without losing the current session state. Memory usage in fullscreen mode remains flat over time — output is rendered without accumulating in the terminal's scrollback buffer — making it more suitable for very long sessions where standard terminals can degrade.

## Key Topics

- Opt-in mode via `CLAUDE_CODE_NO_FLICKER=1` environment variable
- Renders on alternate screen buffer to eliminate flicker
- Requires [[Claude Code]] v2.1.89+
- Mouse support: click-to-expand, URL clicking, text selection, scrolling
- Transcript mode (Ctrl+O) with search capability
- Flat memory usage regardless of session length
- Not available in default terminal rendering mode
