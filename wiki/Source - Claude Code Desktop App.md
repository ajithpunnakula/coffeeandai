---
title: "Source - Claude Code Desktop App"
type: source
date: 2026-04-13
source_file: "raw/use-claude-code-desktop.md"
tags: [claude-code, features]
---

# Source - Claude Code Desktop App

The Claude Desktop app's Code tab is a graphical interface for [[Claude Code]] running the same underlying engine as the CLI. Before starting a session, users configure the environment (Local, Remote/cloud, or SSH), project folder, model, and [[Permission Modes]]. Available modes include Ask permissions (default, requires approval per change), Auto accept edits (auto-approves file edits and common filesystem commands), Plan mode (explores without editing), Auto (research preview requiring Sonnet 4.6+ on Team/Enterprise), and Bypass permissions (no prompts, sandboxes only). Remote sessions restrict to Auto accept edits and Plan mode.

The diff view appears after Claude makes changes, showing a file list and per-file diffs with line-level commenting. Users can annotate specific lines, batch-submit comments, or click "Review code" to have Claude self-evaluate the changes. GitHub PR monitoring polls CI check results via the GitHub CLI (`gh` required) and supports auto-fix (Claude iterates on failures) and auto-merge (squash merge once all checks pass). Computer use is a research preview on macOS and Windows (Pro/Max only) that lets Claude control the screen; browsers are view-only, terminals/IDEs are click-only, and everything else gets full control, with per-session app-level approval prompts.

Parallel sessions are created via "+ New session" in the sidebar. Each session in a Git repo gets an isolated [[Git Worktrees]] copy stored in `<project-root>/.claude/worktrees/`. Sessions can be filtered by status and environment. When context fills, Claude automatically compacts; users can also trigger `/compact` manually. Long-running tasks can be sent to Remote (Anthropic cloud) sessions that persist after the app closes, observable from claude.ai or the Claude mobile app. The "Continue in" menu allows moving a local session to web or opening in a supported IDE.

Extensibility features include: Connectors for GitHub, Slack, Linear, and more; skill invocation via `/` or the `+` button; plugin installation from the prompt box; and app preview with an embedded browser that auto-verifies changes (takes screenshots, inspects DOM, fills forms). Dispatch integration allows mobile-to-desktop task delegation. Enterprise admins can restrict available permission modes and configure server-managed settings.

## Key Topics

- Session setup: environment (Local/Remote/SSH), folder, model, [[Permission Modes]]
- [[Permission Modes]]: Ask, Auto accept edits, Plan, Auto (research preview), Bypass
- Visual diff view with per-line commenting and batch submission
- "Review code" button for Claude self-review of diffs
- GitHub PR monitoring: auto-fix and auto-merge via `gh` CLI
- Computer use (research preview): screen control on macOS/Windows, Pro/Max only
- App permissions tiers: view-only (browsers), click-only (terminals/IDEs), full control
- Parallel sessions with [[Git Worktrees]] isolation in `.claude/worktrees/`
- Remote sessions on Anthropic cloud: persist after app closes, monitorable from mobile
- "Continue in" menu: migrate local session to web or IDE
- App preview with embedded browser and auto-verification
- Dispatch: mobile-to-desktop task delegation
- Connectors: GitHub, Slack, Linear; plugins and skills via `+` button
- Enterprise admin controls on permission modes
