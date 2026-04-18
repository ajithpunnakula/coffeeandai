---
title: "Source - Claude Code Status Line"
type: source
date: 2026-04-13
source_file: "raw/customize-your-status-line.md"
tags: [claude-code, features, configuration]
---

# Source - Claude Code Status Line

[[Claude Code]] includes a customizable status line — a persistent bar at the bottom of the terminal interface that displays session-relevant information. The status line is powered by a user-provided shell script: [[Claude Code]] passes JSON session data (context usage, cost, model, git status, etc.) to the script on stdin, and renders whatever the script outputs. This script-based architecture means any information computable in a shell script can be surfaced in the status line.

Common status line displays include [[Context Window]] usage percentage, cumulative session cost, current model name, and git branch or diff summary. The `/statusline` command accepts a natural language description and generates a status line script to match, lowering the barrier to customization for users who prefer not to write shell scripts directly.

A `refreshInterval` property in the status line configuration enables time-based updates, allowing the status line to poll external data sources (e.g., CI status, deploy health) and refresh on a schedule independent of user interaction. This makes the status line useful as a lightweight ambient dashboard during long [[Subagents]] runs or background tasks.

## Key Topics

- Persistent bar at bottom of terminal interface
- Powered by a user-provided shell script
- JSON session data passed on stdin to the script
- Common displays: [[Context Window]] usage, cost, model, git status
- `/statusline` command generates scripts from natural language descriptions
- `refreshInterval` property for time-based polling updates
- Can surface external data (CI status, deploy health, etc.)
- Useful during long [[Subagents]] runs or background tasks
