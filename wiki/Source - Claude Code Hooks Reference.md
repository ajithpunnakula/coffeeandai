---
title: "Source - Claude Code Hooks Reference"
type: source
date: 2026-04-13
source_file: "raw/hooks-reference.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Hooks Reference

[[Hooks]] in [[Claude Code]] are user-defined shell commands, HTTP endpoints, LLM prompts, or agent-based handlers that execute automatically at specific lifecycle points. This reference documents the complete hook system: 26+ lifecycle events, the four handler types, configuration schema, JSON input/output formats, matcher patterns, the `if` field for granular filtering, async execution, `permissionDecision` output for blocking tools, and advanced topics like MCP tool hooks.

Hook events fall into three cadences: once per session (`SessionStart`, `SessionEnd`), once per turn (`UserPromptSubmit`, `Stop`, `StopFailure`), and on every tool call in the agentic loop (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`). Standalone async events include `Notification`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, and `ElicitationResult`. `PreToolUse` hooks can block tool execution by returning `permissionDecision: "deny"`. `PermissionDenied` hooks can return `{retry: true}` to allow the model to retry.

Hook configuration uses three levels of nesting: the hook event name (e.g., `PreToolUse`), a matcher group that filters when the hook fires, and one or more hook handlers inside the group. The `matcher` field can be a plain string (substring match on tool name), a regex (if it contains regex metacharacters), or a glob pattern. The `if` field provides a secondary filter using `Tool(pattern)` syntax — if the condition fails, the handler process is never spawned, avoiding overhead. Input arrives as JSON on stdin (for command hooks) or as the POST body (for HTTP hooks). Hook handler types: `command` (shell script/binary), `http` (POST to a URL), `prompt` (single-turn LLM evaluation), `agent` (full subagent with tools for complex verification).

Hook scope determines where configuration lives: `~/.claude/settings.json` (personal, all projects), `.claude/settings.json` (project, sharable via version control), `.claude/settings.local.json` (project-local, gitignored), managed policy settings (organization-wide), plugin `hooks/hooks.json` (bundled with a [[Plugins]]), or skill/agent frontmatter (active while the component runs). Enterprise administrators can use `allowManagedHooksOnly` to block user, project, and plugin hooks — except hooks from force-enabled managed plugins, which are exempt.

## Key Topics

- 26+ lifecycle events across session, turn, and per-tool-call cadences
- Four handler types: command (shell), HTTP (POST), prompt (single-turn LLM), agent (subagent with tools)
- `matcher` field: string substring, regex, or glob pattern
- `if` field: secondary filter (`Tool(pattern)`) to avoid spawning processes unnecessarily
- `permissionDecision` output for `PreToolUse`: `"allow"`, `"deny"`, `"allowAndBypass"`
- `{retry: true}` return from `PermissionDenied` hooks
- Async events: `CwdChanged`, `FileChanged`, `InstructionsLoaded`, `ConfigChange`, `Notification`
- Compaction events: `PreCompact`, `PostCompact`
- Worktree events: `WorktreeCreate`, `WorktreeRemove`
- MCP elicitation events: `Elicitation`, `ElicitationResult`
- Hook scope and `allowManagedHooksOnly` enterprise setting
