---
title: "Source - How Claude Code Works"
type: source
date: 2026-04-13
source_file: "raw/how-claude-code-works.md"
tags: [claude-code, features]
---

# Source - How Claude Code Works

[[Claude Code]] operates through a three-phase [[Agentic Loop]]: **gather context**, **take action**, and **verify results**. These phases blend together continuously — Claude uses tools throughout, whether searching files to understand code, editing to make changes, or running tests to verify work. The loop adapts to the task: a codebase question may need only context gathering, while a refactor cycles through all three phases repeatedly. The user remains part of the loop and can interrupt at any point to steer, correct, or redirect.

The loop is powered by two components: Claude models (which reason about tasks) and five categories of built-in tools (which act on the environment). The tool categories are: **file operations** (read, edit, create, rename), **search** (pattern matching, regex, codebase exploration), **execution** (shell commands, servers, tests, git), **web** (web search, documentation fetch), and **code intelligence** (type errors, jump-to-definition, find-references — requires code intelligence plugins). These base capabilities can be extended with [[Skills]] (on-demand domain knowledge), [[MCP]] servers (external service connectivity), [[Hooks]] (automated script triggers), and [[Subagents]] (isolated parallel context windows).

Session management is central to how Claude Code persists work. Each session is stored as a JSONL file under `~/.claude/projects/`, enabling resume (`--continue`), fork (`--fork-session`), and rewind (Esc twice for checkpoints). Sessions are independent — each starts with a fresh [[Context Window]] — but [[CLAUDE.md File]] and auto-memory provide persistence across sessions. The [[Context Window]] holds conversation history, file contents, command outputs, CLAUDE.md, auto-memory, loaded skills, and system instructions. As context fills, Claude auto-compacts by clearing old tool outputs then summarizing; users can also run `/compact` with a focus directive or `/context` to inspect usage. [[Subagents]] get their own fresh context, preventing long tasks from bloating the main session.

[[Permission Modes]] control what Claude can do without asking. Four modes are available: Default (asks before edits and commands), Auto-accept edits (files and common filesystem commands run without prompting), Plan mode (read-only tools only, producing a reviewable plan), and Auto mode (a background classifier evaluates all actions — currently a research preview). Specific commands can be allowlisted in `.claude/settings.json`. Checkpoints (file snapshots taken before every edit) allow undoing changes independently of git.

## Key Topics

- [[Agentic Loop]]: three phases — gather context, take action, verify results
- Five built-in tool categories: file operations, search, execution, web, code intelligence
- Extension layer: [[Skills]], [[MCP]], [[Hooks]], [[Subagents]]
- Three execution environments: local (default), cloud (Anthropic-managed VMs), Remote Control (local controlled from browser)
- Session storage: JSONL files at `~/.claude/projects/`; resume, fork, and rewind support
- [[Context Window]] management: auto-compaction, `/compact`, `/context`, deferred MCP tool definitions
- [[Subagents]] provide isolated context windows for long tasks
- [[Permission Modes]]: Default, Auto-accept edits, Plan mode, Auto mode (research preview)
- Checkpoints: file snapshots before every edit, reversible via Esc-Esc
- [[CLAUDE.md File]] and auto-memory for cross-session persistence
