---
title: "Source - Claude Code Commands Reference"
type: source
date: 2026-04-13
source_file: "raw/commands.md"
tags: [claude-code, features]
---

# Source - Claude Code Commands Reference

[[Claude Code]] exposes a set of `/` commands for controlling sessions, managing context, and invoking specialized workflows. Built-in commands handle core operations like `/compact` (summarize and compress context), `/rewind` (checkpoint restoration), `/cost` (token usage display), and `/ultraplan` (extended planning mode). These are distinct from [[Skills]], which are user-defined or bundled script-based extensions.

Bundled skills ship with [[Claude Code]] and cover common multi-agent workflows: `/batch` runs parallel changes across a codebase using multiple subagents, `/simplify` runs a 3-agent review pipeline for code quality, `/loop` sets up recurring prompt execution on an interval, and `/debug` assists with systematic debugging sessions. The `/claude-api` skill assists with building applications against the Anthropic SDK. `/autofix-pr` automates pull request fixes based on CI feedback.

[[MCP]] prompts from connected servers surface as `/mcp__server__prompt` commands, following a namespaced convention that prevents collisions between built-ins and external tools. This unified command surface means users interact with both local and remote capabilities through the same slash-command interface.

## Key Topics

- Built-in commands: `/compact`, `/rewind`, `/cost`, `/ultraplan`, `/autofix-pr`
- Bundled [[Skills]]: `/batch`, `/simplify`, `/loop`, `/debug`, `/claude-api`
- [[MCP]] prompt commands (`/mcp__server__prompt` naming convention)
- Distinction between built-in commands and skills
- Parallel codebase change execution via `/batch`
- 3-agent review pipeline via `/simplify`
- Recurring prompt scheduling via `/loop`
