---
title: "Source - Subagents in the SDK"
type: source
date: 2026-04-17
source_file: "raw/subagents-in-the-sdk.md"
tags: [agent-sdk, subagents, agentic-architecture]
---

This source provides comprehensive documentation on [[Subagents]] within the [[Agent SDK]], covering programmatic definition, invocation, context inheritance, tool restrictions, and session management. Subagents are separate agent instances that the main agent spawns to handle focused subtasks, offering context isolation, parallelization, specialized instructions, and restricted tool access.

Subagents can be created in three ways: programmatically via the `agents` parameter in `query()` options (recommended for SDK applications), as filesystem-based markdown files in `.claude/agents/` directories, or using the built-in `general-purpose` subagent that Claude can invoke at any time via the Agent tool. The `AgentDefinition` configuration includes fields for `description` (required, determines when Claude uses the agent), `prompt` (required, the system prompt), `tools` (optional tool restrictions), `model` (optional model override supporting sonnet, opus, haiku, or inherit), `skills`, `memory`, and `mcpServers`.

A key architectural detail is what subagents inherit: they receive their own system prompt and the Agent tool's prompt, plus the project [[CLAUDE.md File]] loaded via `settingSources`, and tool definitions. However, they do not receive the parent's conversation history, tool results, system prompt, or [[Skills]] (unless explicitly listed). Subagents cannot spawn their own subagents, preventing recursive delegation chains.

The document covers subagent resumption, where subagents can be resumed to continue where they left off by capturing the session ID and agent ID from the first invocation. Subagent transcripts persist independently of the main conversation and are unaffected by main conversation compaction. Detection of subagent invocation is done by checking for `tool_use` blocks where the name is `"Agent"` (renamed from `"Task"` in Claude Code v2.1.63).

## Key Topics

- Three creation methods: programmatic `agents` parameter, filesystem `.claude/agents/`, and built-in `general-purpose` subagent
- Context isolation: subagents get fresh conversation windows with only their prompt and Agent tool's prompt
- Parallelization allows multiple subagents to run concurrently for faster workflows
- `AgentDefinition` fields: `description`, `prompt`, `tools`, `model`, `skills`, `memory`, `mcpServers`
- Subagents cannot spawn their own subagents (no `Agent` in a subagent's `tools`)
- Subagent resumption via captured session ID and agent ID
- Tool renamed from `"Task"` to `"Agent"` in [[Claude Code]] v2.1.63
- Dynamic agent configuration via factory functions for runtime customization
- Common tool combinations: read-only analysis, test execution, code modification, full access
