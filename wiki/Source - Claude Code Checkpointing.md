---
title: "Source - Claude Code Checkpointing"
type: source
date: 2026-04-13
source_file: "raw/checkpointing.md"
tags: [claude-code, features]
---

# Source - Claude Code Checkpointing

[[Checkpointing]] in [[Claude Code]] automatically captures file state snapshots before each prompt's edits are applied, creating a recoverable history of the workspace as the session progresses. These snapshots persist for 30 days and are accessible via the `/rewind` command or the `Esc+Esc` keyboard shortcut, which opens a message list showing the full prompt history with restore options at each point.

When rewinding, users have three restoration options: restore both code and conversation (full rollback to that point), restore code only (revert file changes while keeping the conversation intact), or restore conversation only (keep file changes but revert the dialogue context). A fourth option — "summarize from point" — generates a summary of the session from a selected message forward, useful for compressing context without losing information.

An important limitation is that [[Checkpointing]] only tracks file changes made through [[Claude Code]]'s file tools (Read, Write, Edit). Changes made via Bash commands, external editors, or other tools operating outside the file tool layer are not captured in snapshots. This means bash-driven file modifications during a session cannot be rewound through the checkpoint system.

## Key Topics

- Automatic per-prompt file state snapshots before edits
- Snapshots persist for 30 days
- Access via `/rewind` command or `Esc+Esc` shortcut
- Restore options: code+conversation, code only, conversation only
- "Summarize from point" option for context compression
- Only captures changes from [[Claude Code]]'s file tools
- Bash commands and external edits are NOT tracked
- Integrates with [[Source - Claude Code Interactive Mode|Claude Code Interactive Mode]] session flow
