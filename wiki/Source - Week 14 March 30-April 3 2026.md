---
title: "Source - Week 14 March 30-April 3 2026"
type: source
date: 2026-04-17
source_file: "raw/week-14-march-30-april-3-2026.md"
tags: [changelog, claude-code, computer-use, mcp, plugins, rendering]
---

Week 14 of [[Claude Code]] releases (v2.1.86 through v2.1.91) shipped five features between March 30 and April 3, 2026. The highlights are [[Computer Use]] expanding to the CLI, interactive in-product lessons, flicker-free rendering, per-tool [[MCP]] result-size overrides, and plugin executables on PATH.

**[[Computer Use]] in the CLI** extends the desktop-only capability from Week 13 to the terminal. Claude can now open native apps, click through UIs, test its own changes, and fix what breaks, all from the command line. This closes the verification loop for native iOS, macOS, and other GUI-only applications that previously had no programmatic testing path. Users enable it via the `/mcp` command by toggling `computer-use` on. The feature is described as still early with rough edges.

**`/powerup`** (v2.1.90) introduces interactive in-product lessons that teach [[Claude Code]] features through animated demos directly in the terminal. Given the rapid release cadence of [[Claude Code]], this helps users discover features they may have missed. It represents [[Anthropic]]'s investment in onboarding and feature discovery.

**Flicker-free rendering** (v2.1.89) offers a new alt-screen renderer with virtualized scrollback. The prompt input stays pinned to the bottom, mouse selection works across long conversations, and redraw flicker is eliminated. Users opt in via the `CLAUDE_CODE_NO_FLICKER` environment variable.

**[[MCP]] result-size override** (v2.1.91) allows MCP server authors to raise the truncation cap on specific tools by setting `anthropic/maxResultSizeChars` in the tool's `tools/list` entry, up to a hard ceiling of 500K characters. Previously the cap was global, so tools returning inherently large payloads like database schemas or full file trees hit the default limit and had results persisted to disk. Per-tool overrides keep those results inline when needed.

**Plugin executables on PATH** (v2.1.91) enables [[Plugins]] to place executables in a `bin/` directory at the plugin root. [[Claude Code]] automatically adds that directory to the Bash tool's PATH while the plugin is enabled, so Claude can invoke the binary as a bare command without absolute paths or wrapper scripts.

Other wins include: Auto mode follow-ups with a new `PermissionDenied` hook and manual retry via `/permissions`; a new `defer` value for `permissionDecision` in `PreToolUse` [[Hooks]] enabling SDK apps to pause and resume tool calls; `/buddy` (April Fools); `disableSkillShellExecution` setting to block inline shell from [[Skills]]; Edit tool working on files viewed via `cat` or `sed -n`; hook output over 50K saved to disk; thinking summaries off by default; voice mode improvements; and multi-line deep link support.

## Key Topics

- [[Computer Use]] extended from Desktop to CLI for terminal-based GUI verification
- `/powerup` interactive lessons for feature discovery in [[Claude Code]]
- Flicker-free alt-screen rendering with virtualized scrollback
- Per-tool [[MCP]] result-size overrides up to 500K characters
- [[Plugins]] bin/ directory for executables on PATH
- `PermissionDenied` hook event for [[Permission Modes]] auto mode
- `defer` value in PreToolUse [[Hooks]] for SDK pause/resume workflows
- `disableSkillShellExecution` setting for [[Skills]] security
- Edit tool usability improvements
- Voice mode push-to-talk and platform-specific fixes
