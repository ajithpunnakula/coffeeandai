---
title: "Source - Claude Code Directory Reference"
type: source
date: 2026-04-13
source_file: "raw/explore-the-claude-directory.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Directory Reference

The `.claude/` project directory and `~/.claude/` user directory together house all [[Claude Code]] configuration, customization, and extension files. The reference documents every file in both locations: `CLAUDE.md` (project instructions loaded into every session), `.mcp.json` (project-level [[MCP]] server configuration), `.worktreeinclude` (files to sync across [[Git Worktrees]]), `settings.json` and `settings.local.json` (shared and local [[Source - Claude Code Settings Reference|Claude Code Settings]]), and subdirectories for [[Hooks]], [[Skills]], rules, agents, and output styles.

Each entry in the reference specifies when the file loads, tips for effective use, and examples. This is particularly valuable for understanding load order and precedence — for example, `settings.local.json` overrides `settings.json`, and project-level `.mcp.json` overrides global [[MCP]] configuration for the same server name. Understanding these precedence rules is essential for managing configuration across teams where global and project-level settings may conflict.

A key distinction documented here is between **commands** and **skills**: commands are the legacy extension mechanism (scripts in a `commands/` directory), while [[Skills]] are the current recommended approach (scripts in `skills/` with richer metadata support). Both are surfaced as `/` commands in the interface, but [[Skills]] support additional features like descriptions and parameter schemas visible in the [[Source - Claude Code Commands Reference|Claude Code Commands Reference]].

## Key Topics

- `.claude/` project directory and `~/.claude/` user directory structure
- `CLAUDE.md`: project instructions (loaded every session)
- `.mcp.json`: project-level [[MCP]] server configuration
- `.worktreeinclude`: file sync across [[Git Worktrees]]
- `settings.json` and `settings.local.json`: shared vs. local [[Source - Claude Code Settings Reference|Claude Code Settings]]
- Subdirectories: hooks/, skills/, rules/, agents/, output-styles/
- Load order and precedence rules (local overrides shared)
- Commands (legacy) vs. [[Skills]] (recommended): both surface as `/` commands
- [[Hooks]] directory for automation scripts
