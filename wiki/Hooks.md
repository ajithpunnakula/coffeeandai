---
title: "Hooks"
type: concept
tags: [extensions, claude-code]
sources: ["raw/hooks-reference.md", "raw/automate-workflows-with-hooks.md", "raw/extend-claude-code.md", "raw/intercept-and-control-agent-behavior-with-hooks.md"]
---

# Hooks

Hooks are shell commands or other handlers that [[Claude Code]] automatically executes in response to lifecycle events, enabling automation, enforcement, and observability without requiring manual intervention. They are a foundational extension primitive that sits below [[Skills]] and [[Plugins]] in the stack — hooks react to what Claude does, rather than extending what Claude knows or can do.

[[Claude Code]] exposes 26+ hook events. Key examples include: **SessionStart** (runs once when a session opens), **PreToolUse** (fires before every tool call, can block it), **PostToolUse** (fires after every tool call, useful for auto-formatting), **Stop** (when Claude finishes a turn), **Notification** (when Claude sends a notification), **SubagentStart** (when a [[Subagents|subagent]] launches), **WorktreeCreate** (when a [[Git Worktrees|git worktree]] is created), **PreCompact** (before context compaction, allowing injection of summary context), **CwdChanged** (when the working directory changes), and **ConfigChange** (when settings are modified, enabling audit trails).

Four handler types are available. A **command** handler runs a shell script that receives event data on stdin and can write a response to stdout. An **HTTP** handler POSTs event data to a URL, enabling integration with external services. A **prompt** handler invokes a single-turn LLM evaluation — useful for nuanced policy decisions. An **agent** handler launches a full [[Subagents|subagent]] with its own tools for complex verification tasks. The most powerful hook type is a PreToolUse handler that returns `permissionDecision: deny`, which blocks the tool call entirely — enabling policy-as-code enforcement without modifying [[Permission Modes]].

Hooks are configured in `settings.json` at user, project, local, or managed scope (the same scoping hierarchy as [[CLAUDE.md File]]). Common use cases include: auto-running Prettier after file edits (PostToolUse on Write), injecting fresh context after compaction (PreCompact), logging all config changes for compliance (ConfigChange), and notifying external systems when tasks complete (Stop). Hooks integrate tightly with [[Plugins]] — plugin manifests can declare hooks that install alongside the plugin's [[Skills]] and [[MCP]] servers.

## See also

- [[Skills]]
- [[Plugins]]
- [[Subagents]]
- [[Permission Modes]]
- [[Claude Code]]
