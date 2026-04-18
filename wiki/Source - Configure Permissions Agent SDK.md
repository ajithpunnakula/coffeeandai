---
title: "Source - Configure Permissions Agent SDK"
type: source
date: 2026-04-17
source_file: "raw/configure-permissions-agent-sdk.md"
tags: [agent-sdk, permissions, security, tools]
---

This source provides comprehensive documentation on the [[Agent SDK]]'s permission system for controlling how Claude uses tools. It covers [[Permission Modes]], allow/deny rules, and the full permission evaluation flow.

When Claude requests a tool, the SDK evaluates permissions in a strict order: (1) [[Hooks]] run first and can allow, deny, or pass through; (2) deny rules from `disallowed_tools` and `settings.json` are checked -- if matched, the tool is blocked even in `bypassPermissions` mode; (3) the active [[Permission Modes]] is applied; (4) allow rules from `allowed_tools` and `settings.json` are checked; (5) if still unresolved, the `canUseTool` callback is called (skipped in `dontAsk` mode, which denies instead).

The `allowed_tools` option pre-approves listed tools but does not constrain `bypassPermissions` -- unlisted tools still pass through to the permission mode, which approves everything. For a locked-down agent, the recommended pattern is `allowedTools` paired with `permissionMode: "dontAsk"`. The `disallowed_tools` option blocks tools regardless of other settings, making it the only reliable way to restrict tools when using `bypassPermissions`.

Six [[Permission Modes]] are available: `default` (no auto-approvals, triggers `canUseTool` callback), `dontAsk` (denies instead of prompting), `acceptEdits` (auto-approves file edits and filesystem commands like mkdir, touch, rm, mv, cp, sed within the working directory), `bypassPermissions` (approves all tools), `plan` (no tool execution, Claude only plans), and `auto` (TypeScript only, model classifier approves/denies each call).

An important warning notes that when the parent agent uses `bypassPermissions`, `acceptEdits`, or `auto`, all [[Subagents]] inherit that mode and it cannot be overridden per subagent. Permission modes can be changed dynamically mid-session via `set_permission_mode()` (Python) or `setPermissionMode()` (TypeScript), allowing progressive trust escalation.

## Key Topics

- Five-step permission evaluation flow (hooks, deny, mode, allow, callback)
- [[Permission Modes]]: default, dontAsk, acceptEdits, bypassPermissions, plan, auto
- `allowed_tools` for pre-approving specific tools
- `disallowed_tools` as the only way to block tools in bypassPermissions
- `dontAsk` + `allowedTools` pattern for locked-down agents
- `acceptEdits` auto-approving file edits and filesystem commands
- Dynamic permission mode changes mid-session
- [[Subagents]] inheriting parent permission modes
- [[Hooks]] as the first step in permission evaluation
- `canUseTool` callback for interactive approval flows
- Scoped tool rules like `Bash(npm *)` for command filtering
- Declarative allow/deny rules in `.claude/settings.json`
