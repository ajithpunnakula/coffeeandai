---
title: "Source - Claude Code CLI Reference"
type: source
date: 2026-04-13
source_file: "raw/cli-reference.md"
tags: [claude-code, features, configuration]
---

# Source - Claude Code CLI Reference

[[Claude Code]]'s CLI provides extensive flags covering launch modes, tool restrictions, output formats, and session management. The primary launch modes are interactive (default), print/SDK mode (`-p`) for non-interactive scripted use, and session continuation or resumption flags for picking up prior conversations. The `--bare` flag skips local configuration entirely, making it suitable for scripting environments where user-specific settings would interfere.

[[Permission Modes]] are configurable at launch via CLI flags, allowing callers to set the trust level before a session begins rather than relying on interactive prompts. Tool restrictions let callers whitelist or blacklist specific tools, enabling tightly scoped agent invocations. System prompt customization flags allow injecting or overriding the default system prompt, which is useful when embedding [[Claude Code]] inside larger pipelines.

Output format selection (`text`, `json`, `stream-json`) supports both human-readable display and machine-parseable structured output. Model selection flags allow overriding the default model per invocation. Worktree creation and remote session flags integrate with [[Git Worktrees]] and remote control workflows, enabling parallel isolated workspaces and device-agnostic session access.

## Key Topics

- Interactive vs. print/SDK mode (`-p`)
- Session continuation and resumption flags
- `--bare` mode for scripting without local config
- [[Permission Modes]] flags at launch time
- Tool allowlist/blocklist restrictions
- Output formats: `text`, `json`, `stream-json`
- Model selection per invocation
- [[Git Worktrees]] creation via CLI
- Remote session flags
- System prompt injection and override flags
