---
title: "Source - Claude Code What's New"
type: source
date: 2026-04-13
source_file: "raw/what-s-new.md"
tags: [claude-code, features]
---

# Source - Claude Code What's New

The What's New page is a weekly digest of notable [[Claude Code]] features, maintained as a reverse-chronological feed. Each entry summarizes the highest-impact changes shipped in a given week, includes runnable examples where applicable, and links to full documentation. For exhaustive per-release changelogs, a separate changelog page exists. The digest focuses on features likely to change how users work day-to-day.

**Week 14 (March 30 – April 3, 2026, v2.1.86–v2.1.91):** Computer use arrives in the CLI as a research preview, allowing Claude to open native desktop apps, click through GUIs, and verify changes from the terminal. This closes the loop for tasks that can only be verified visually. Also shipped: `/powerup` interactive lessons, flicker-free alt-screen rendering (eliminates visual artifacts during long outputs), a per-tool [[MCP]] result-size override configurable up to 500K tokens, and plugin executables are now added to the Bash tool's PATH so plugins can ship their own CLI binaries.

**Week 13 (March 23–27, 2026, v2.1.83–v2.1.85):** [[Permission Modes|Auto Mode]] (permission mode) lands as a research preview — a background classifier handles permission prompts automatically, running safe actions without interruption and blocking risky ones. This sits between full manual approval and `--dangerously-skip-permissions`. Additional features: computer use in the Desktop app, PR auto-fix on the Web surface, transcript search with `/` key, a native PowerShell tool for Windows users, and conditional `if` [[Hooks]] (hooks that fire only when a specified condition is met).

## Key Topics

- **Week 14** features: computer use in CLI (research preview), `/powerup` interactive lessons
- Flicker-free alt-screen rendering for smoother long-running sessions
- Per-tool [[MCP]] result-size override (up to 500K tokens per tool)
- Plugin executables on Bash tool PATH
- **Week 13** features: [[Permission Modes|Auto Mode]] permission classifier (research preview)
- Computer use in Desktop app
- PR auto-fix on web surface
- Transcript search with `/` key in session
- Native PowerShell tool for Windows
- Conditional `if` [[Hooks]]
