---
title: "Source - Intercept and Control Agent Behavior with Hooks"
type: source
date: 2026-04-17
source_file: "raw/intercept-and-control-agent-behavior-with-hooks.md"
tags: [agent-sdk, hooks, security, observability]
---

This source provides comprehensive documentation on [[Hooks]] within the [[Agent SDK]], covering how callback functions can intercept and customize agent behavior at key execution points. Hooks enable blocking dangerous operations, logging and auditing tool calls, transforming inputs and outputs, requiring human approval for sensitive actions, and tracking session lifecycle.

The hook system follows a five-step flow: an event fires, the SDK collects registered hooks, matchers filter which hooks run, callback functions execute, and the callback returns a decision. The SDK provides an extensive set of hook events. Both Python and TypeScript support `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PermissionRequest`, and `Notification`. TypeScript additionally supports `SessionStart`, `SessionEnd`, `Setup`, `TeammateIdle`, `TaskCompleted`, `ConfigChange`, `WorktreeCreate`, and `WorktreeRemove`.

Matchers use regex patterns to filter when callbacks fire. For tool-based hooks, the matcher tests against the tool name (e.g., `"Write|Edit"` or `"^mcp__"`). Matchers only filter by tool name, not by file paths or other arguments; path-level filtering must happen inside the callback. The callback receives input data, a tool use ID (correlating Pre and Post events), and a context object with an `AbortSignal` in TypeScript.

Callback outputs operate on two levels: top-level fields (`systemMessage` for injecting conversation context, `continue`/`continue_` for controlling agent execution) and `hookSpecificOutput` fields (like `permissionDecision` with values `"allow"`, `"deny"`, or `"ask"`, and `updatedInput` for modifying tool arguments). When multiple hooks apply, deny takes priority over ask, which takes priority over allow. Async outputs (`async: true`) allow hooks to perform side effects without blocking the agent.

## Key Topics

- [[Hooks]] are callback functions that run in response to agent events like tool calls and session lifecycle
- 17+ hook event types spanning tool use, subagent activity, notifications, and session management
- Matchers use regex patterns against tool names (e.g., `"Write|Edit"`, `"^mcp__"`)
- `permissionDecision` values: `"allow"`, `"deny"`, `"ask"` -- deny takes priority
- `updatedInput` can modify tool arguments (requires `permissionDecision: "allow"`)
- `systemMessage` injects context into the conversation visible to the model
- Async outputs (`async: true`) for non-blocking side effects like logging and webhooks
- Hooks can chain: execute in array order with each focused on a single responsibility
- `SessionStart`/`SessionEnd` only available as SDK callbacks in TypeScript, not Python
- [[Subagents]] do not inherit parent permissions; use `PreToolUse` hooks for auto-approval
