---
title: "Source - Claude Code Hooks Quickstart"
type: source
date: 2026-04-13
source_file: "raw/automate-workflows-with-hooks.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Hooks Quickstart

[[Hooks]] in [[Claude Code]] provide deterministic automation by running shell commands at specific lifecycle points — without relying on the LLM to choose to run them. This guide covers practical hook patterns with ready-to-use configuration blocks. Hook configuration is added to `hooks` blocks in settings JSON files, and the `/hooks` menu (read-only browser) shows all configured hooks with event, matcher, type, source, and command details.

The guide covers seven common automation patterns. Desktop notifications on the `Notification` event fire when Claude needs input, using `osascript` on macOS, `notify-send` on Linux, or PowerShell on Windows. Auto-formatting uses `PostToolUse` with an `Edit|Write` matcher to pipe the edited file path (extracted with `jq`) to Prettier after every file edit. Blocking edits to protected files uses `PreToolUse` to read the target file path and return `permissionDecision: "deny"` when the path matches a protected pattern. Context re-injection after compaction uses the `PostCompact` event to inject a summary or key context back into the session so Claude doesn't lose critical state. Auditing configuration changes uses `ConfigChange` to log whenever Claude Code's own settings are modified. Reloading environment variables uses `CwdChanged` to run `direnv allow` and `direnv export json` whenever the working directory changes, keeping environment variables in sync. Auto-approving specific permission prompts uses `PermissionRequest` to return `permissionDecision: "allow"` for known-safe operations, reducing interruptions.

Hook types progress from simple to complex: command hooks run shell scripts with no LLM involvement (zero context cost, most predictable); prompt-based hooks use a Claude model to evaluate conditions requiring judgment (e.g., "is this change dangerous?") and return a decision; agent-based hooks spawn a full subagent with tools for complex verification tasks that require reading files or executing commands before deciding. Prompt and agent hooks are appropriate when deterministic rules are insufficient and the decision requires reasoning.

Hook location determines scope: `~/.claude/settings.json` applies to all projects, `.claude/settings.json` applies to a single project and can be committed to version control, `.claude/settings.local.json` is project-local and gitignored. Claude can also be asked directly in the CLI to write hook configuration.

## Key Topics

- Desktop notifications: `Notification` event, platform-specific commands (macOS/Linux/Windows)
- Auto-formatting: `PostToolUse` + `Edit|Write` matcher + Prettier via `jq`
- Blocking protected files: `PreToolUse` + `permissionDecision: "deny"`
- Context re-injection after compaction: `PostCompact` event
- Auditing config changes: `ConfigChange` event
- Environment reload: `CwdChanged` + direnv integration
- Auto-approving safe permissions: `PermissionRequest` + `permissionDecision: "allow"`
- Three hook types: command (shell), prompt (LLM judgment), agent (subagent with tools)
- Hook scope: `~/.claude/settings.json` vs `.claude/settings.json` vs `.claude/settings.local.json`
- `/hooks` menu for browsing configured hooks (read-only)
