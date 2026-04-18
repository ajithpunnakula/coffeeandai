---
title: "Source - Claude Code VS Code Extension"
type: source
date: 2026-04-13
source_file: "raw/use-claude-code-in-vs-code.md"
tags: [claude-code, ide-integration]
---

# Source - Claude Code VS Code Extension

The [[VS Code Extension]] extension provides a native graphical interface for [[Claude Code]], integrated directly into the editor. It requires VS Code 1.98.0 or higher and also works in Cursor. The extension includes the CLI bundled within it, accessible from VS Code's integrated terminal. Upon installation, users sign in via browser; the extension supports third-party providers like [[Amazon Bedrock]], [[Google Vertex AI]], and [[Microsoft Foundry]] by disabling the login prompt and configuring `~/.claude/settings.json`.

The core interaction happens through a chat panel that can be docked to the sidebar, opened as an editor tab, or floated in a new window. Users can run multiple simultaneous conversations in separate tabs. The prompt box supports @-mention file references (with fuzzy matching and line-range syntax like `@app.ts#5-10`), [[Permission Modes]] switching (normal, Plan, auto-accept), `/compact` for context management, extended thinking, and a command menu (`/`) for MCP servers, hooks, memory, and plugins. Claude's proposed file edits are displayed as side-by-side diffs requiring explicit accept/reject. [[Checkpointing]] is supported: hovering over any message reveals options to fork the conversation, rewind code, or do both.

The built-in IDE [[MCP]] server runs locally on `127.0.0.1` with a random port and a per-activation auth token stored in `~/.claude/ide/` (permissions 0600). It exposes two tools to the model: `mcp__ide__getDiagnostics` (reads VS Code Problems panel) and `mcp__ide__executeCode` (runs Python in the active Jupyter notebook, always requiring a Quick Pick confirmation). Remote sessions started on [[Source - Claude Code on the Web]] can be resumed in VS Code via the "Remote" tab in Past Conversations, provided the user is signed in with a claude.ai subscription.

Configuration is split between VS Code extension settings (controlling panel layout, permission mode defaults, terminal mode, etc.) and the shared `~/.claude/settings.json` (hooks, MCP servers, environment variables, allowed commands). The `/plugins` command opens a graphical plugin manager with scoped installation (user, project, local) and marketplace management. Chrome browser automation is available via the [[Claude in Chrome]] extension (v1.0.36+) using `@browser` mentions or the `--chrome` flag.

## Key Topics

- VS Code 1.98.0+ requirement; also works in Cursor
- Chat panel positioning (sidebar, editor tab, new window); multi-tab conversations
- @-mention file references with fuzzy matching and line-range syntax
- [[Permission Modes]]: normal, Plan, auto-accept, bypass (with `allowDangerouslySkipPermissions`)
- Side-by-side diff review with accept/reject per change
- [[Checkpointing]]: fork conversation, rewind code, or fork+rewind
- Built-in IDE [[MCP]] server: `mcp__ide__getDiagnostics` and `mcp__ide__executeCode`
- Jupyter notebook execution with mandatory Quick Pick confirmation
- Remote session resumption from claude.ai in the Remote tab
- Plugin management UI with user/project/local scopes
- Chrome browser automation via `@browser` mentions
- Shared config with CLI via `~/.claude/settings.json`
- [[Git Worktrees]] support via `--worktree` flag in integrated terminal
- Third-party provider setup ([[Amazon Bedrock]], [[Google Vertex AI]], [[Microsoft Foundry]])
