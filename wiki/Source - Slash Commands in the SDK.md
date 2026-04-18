---
title: "Source - Slash Commands in the SDK"
type: source
date: 2026-04-17
source_file: "raw/slash-commands-in-the-sdk.md"
tags: [agent-sdk, slash-commands, extensibility]
---

This source documents how slash commands work within the [[Agent SDK]], covering both built-in commands and custom command creation. Slash commands are special commands starting with `/` that control [[Claude Code]] sessions. Only commands that work without an interactive terminal are dispatchable through the SDK; available commands are listed in the `system/init` message at session start.

The built-in `/compact` command reduces conversation history size by summarizing older messages while preserving important context. The SDK emits a `compact_boundary` system message with metadata about the compaction, including pre-compaction token count and trigger. Notably, the interactive `/clear` command is not available in the SDK since each `query()` call already starts a fresh conversation. To resume a previous conversation, developers can pass a session ID to the `resume` option.

Custom slash commands can be created as markdown files in `.claude/commands/` (project-level) or `~/.claude/commands/` (user-level) directories, though the document notes these are legacy locations and recommends the newer `.claude/skills/` format instead. Custom commands support YAML frontmatter for configuration (including `allowed-tools`, `description`, and `model` fields), dynamic arguments with `$1`, `$2` placeholders, bash command execution with `!` backtick syntax, and file references using the `@` prefix.

The document provides practical examples including a code review command that uses `git diff` output, a test runner command with pattern arguments, and a security check command with restricted tool access. Commands can be organized in subdirectories for namespacing, though the subdirectory name appears only in the description and does not affect the command name.

## Key Topics

- Slash commands control [[Claude Code]] sessions via the SDK with `/command` syntax
- Available commands listed in the `system/init` message at session start
- `/compact` summarizes conversation history; `/clear` is not available in the SDK
- Custom commands defined as markdown files in `.claude/commands/` (legacy) or `.claude/skills/` (recommended)
- YAML frontmatter supports `allowed-tools`, `description`, `model`, and `argument-hint` fields
- Dynamic arguments via `$1`, `$2` placeholders and `$ARGUMENTS` for the full argument string
- Bash command execution with `!` backtick syntax and file references with `@` prefix
- Subdirectory organization provides namespacing in descriptions
