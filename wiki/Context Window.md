---
title: "Context Window"
type: concept
tags: [features, claude-code]
sources: ["raw/explore-the-context-window.md", "raw/how-claude-code-works.md", "raw/manage-costs-effectively.md", "raw/context-management-reliability.md"]
---

# Context Window

The context window is the finite token space that holds all data active in a [[Claude Code]] session — conversation history, tool results, file contents, instructions, and system prompts. Every token consumed reduces the space available for future reasoning, and performance measurably degrades as the window approaches its limit. Understanding what occupies the context window at startup is foundational to managing both cost and quality.

At session start, before the first user message, [[Claude Code]] loads approximately 7,850+ tokens of fixed overhead. The breakdown (approximate): system prompt (~4,200 tokens), [[Auto Memory]] (~680), environment information (~280), deferred [[MCP]] tool names (~120), [[Skills]] descriptions (~450), global [[CLAUDE.md File]] (~320), and project CLAUDE.md (~1,800). This overhead is why keeping [[CLAUDE.md File]] lean (under 200 lines) and limiting installed [[Skills]] to what's actively needed are important best practices. Path-scoped rules within CLAUDE.md are deferred and only loaded when matching file paths are accessed, reducing upfront cost.

Several mechanisms manage the window during a session. **Auto-compaction** (enabled by default) triggers automatically when the window approaches its limit, summarizing conversation history into a compact representation — [[Hooks]] can intercept this via the `PreCompact` event to inject additional context before summarization. **/compact** triggers manual compaction with an optional focus instruction (e.g., `/compact focus on the authentication refactor`). **/clear** resets the session entirely, which is recommended between unrelated tasks to start fresh. The **/btw** command handles side questions that shouldn't enter history at all.

[[Subagents]] are the most powerful tool for context management: delegating a token-intensive task (such as codebase exploration or log analysis) to an isolated subagent keeps the main window clean and avoids polluting the primary conversation with low-signal tool results. Using cheaper models (e.g., Haiku for the built-in Explore subagent) also reduces cost for high-volume context consumption. The `/explore-context` command in [[Claude Code]] provides a live breakdown of current window usage, useful for diagnosing unexpected token consumption.

## See also

- [[CLAUDE.md File]]
- [[Auto Memory]]
- [[Skills]]
- [[Subagents]]
- [[MCP]]
- [[Hooks]]
- [[Claude Code]]
