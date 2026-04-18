---
title: "Source - Claude Code Changelog"
type: source
date: 2026-04-17
source_file: "raw/changelog.md"
tags: [changelog, releases, features, bug-fixes, claude-code]
---

This source is the official [[Claude Code]] changelog from the documentation site, generated from the CHANGELOG.md on GitHub. It covers releases from v2.1.86 through v2.1.112 (approximately March 27 to April 16, 2026), documenting new features, improvements, and bug fixes across dozens of versions.

The most significant feature additions in this period include: `/ultrareview` for comprehensive multi-agent cloud-based code review (v2.1.111), the `xhigh` effort level for Opus 4.7 (v2.1.111), auto mode availability for Max subscribers on Opus 4.7 (v2.1.111), `/tui` command and `tui` setting for flicker-free fullscreen rendering (v2.1.110), push notification tool for Remote Control (v2.1.110), routines as automated cloud tasks with schedule/API/GitHub triggers, and the `/powerup` interactive feature lessons (v2.1.90). The changelog also documents the `/less-permission-prompts` skill for proposing allowlists (v2.1.111), the `/team-onboarding` command (v2.1.101), and the interactive Bedrock and Vertex AI setup wizards (v2.1.98, v2.1.94).

Infrastructure and performance improvements include: OS CA certificate store trust by default for enterprise TLS proxies (v2.1.101), `ENABLE_PROMPT_CACHING_1H` environment variable for 1-hour [[Prompt Caching]] TTL (v2.1.108), session recap feature with `/recap` command (v2.1.108), [[Plugins]] background monitor support via `monitors` manifest key (v2.1.105), `PreCompact` hook support (v2.1.105), MCP tool result persistence override via `_meta["anthropic/maxResultSizeChars"]` (v2.1.91), and numerous memory leak fixes and performance optimizations for transcript writes and SSE transport.

The changelog reveals extensive work on [[Permission Modes]] and security: fixes for Bash tool permission bypasses, compound command permission checks, `permissions.deny` rule enforcement, `--dangerously-skip-permissions` mode handling, sandboxed subprocess isolation, and PowerShell tool hardening on Windows. [[Hooks]] received several fixes including `PreToolUse` hook `additionalContext` handling, `PermissionDenied` hook for auto mode classifier denials, and hook output capping at 50K characters.

Session management improvements span multiple releases: better `/resume` picker behavior with project filtering, worktree-aware session handling, transcript chain break fixes, and session ID preservation across restarts. The [[Agent SDK]] received fixes for SDK sessions with long conversations and improved `query()` cleanup.

## Key Topics
- `/ultrareview` multi-agent cloud code review feature
- `xhigh` effort level and auto mode for Opus 4.7
- Flicker-free fullscreen rendering via `/tui` command
- Routines for automated cloud tasks with multiple trigger types
- [[Prompt Caching]] with 1-hour TTL option
- Extensive [[Permission Modes]] and security hardening
- [[Hooks]] improvements (PreCompact, PermissionDenied, PreToolUse fixes)
- Session management and `/resume` picker improvements
- [[Plugins]] background monitors and dependency handling
- [[MCP]] OAuth fixes and tool result persistence overrides
- Performance optimizations for memory, transcript writes, and SSE transport
- Interactive setup wizards for Bedrock and Vertex AI
