---
title: "Source - How the Agent Loop Works"
type: source
date: 2026-04-17
source_file: "raw/how-the-agent-loop-works.md"
tags: [agent-sdk, agentic-loop, architecture, context-window]
---

This source provides a deep technical explanation of the [[Agentic Loop]] as implemented in the [[Agent SDK]]. The SDK runs the same execution loop that powers [[Claude Code]]: Claude evaluates a prompt, calls tools to take action, receives results, and repeats until the task is complete. Every session follows a five-step cycle: receive prompt, evaluate and respond, execute tools, repeat, and return result.

A "turn" is one round trip inside the loop where Claude produces output with tool calls, the SDK executes those tools, and results feed back automatically. Turns continue until Claude produces output with no tool calls. The document illustrates this with a concrete example: fixing failing tests takes four turns (run tests, read files, edit and re-run, final summary). Turns can be capped with `max_turns`/`maxTurns` (which counts tool-use turns only) and spending can be limited with `max_budget_usd`/`maxBudgetUsd`.

Five core message types drive the loop: `SystemMessage` (session lifecycle events including `init` and `compact_boundary`), `AssistantMessage` (Claude's responses with text and tool calls), `UserMessage` (tool results), `StreamEvent` (raw API streaming events when partial messages are enabled), and `ResultMessage` (final outcome with cost, usage, session ID, and `stop_reason`). The `ResultMessage.subtype` distinguishes success from error conditions like `error_max_turns`, `error_max_budget_usd`, and `error_during_execution`.

The [[Context Window]] section explains that context accumulates across turns without resetting. System prompts, tool definitions, and [[CLAUDE.md File]] content are automatically subject to [[Prompt Caching]]. When the context window approaches its limit, automatic compaction summarizes older history while preserving recent exchanges. Compaction can be customized via summarization instructions in [[CLAUDE.md File]], a `PreCompact` hook, or manual `/compact` commands. Strategies for keeping context efficient include using [[Subagents]] for subtasks (fresh context per subagent), being selective with tools, watching [[MCP]] server costs, and using lower effort levels.

The effort option controls reasoning depth with levels from `"low"` to `"max"`, trading latency and cost for thoroughness. The `"xhigh"` level is recommended for Opus 4.7. [[Hooks]] fire at specific lifecycle points (PreToolUse, PostToolUse, Stop, SubagentStart/SubagentStop, PreCompact) and run outside the context window. Tool permissions are evaluated through a chain: hooks first, then deny rules, permission mode, allow rules, and finally the `canUseTool` callback.

## Key Topics

- Five-step [[Agentic Loop]] cycle (prompt, evaluate, execute tools, repeat, return)
- Turn counting and `maxTurns`/`maxBudgetUsd` limits
- Five core message types and their roles
- `ResultMessage` subtypes for success and error states
- [[Context Window]] accumulation across turns
- Automatic compaction and customization strategies
- [[Prompt Caching]] for system prompts and tool definitions
- Effort levels (low, medium, high, xhigh, max)
- [[Subagents]] for context-efficient task delegation
- [[Hooks]] lifecycle (PreToolUse, PostToolUse, Stop, PreCompact)
- Parallel vs. sequential tool execution
- Session continuity via session ID capture and resume
