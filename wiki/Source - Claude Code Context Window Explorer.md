---
title: "Source - Claude Code Context Window Explorer"
type: source
date: 2026-04-13
source_file: "raw/explore-the-context-window.md"
tags: [claude-code, features]
---

# Source - Claude Code Context Window Explorer

[[Claude Code]]'s [[Context Window]] Explorer is an interactive simulation tool that visualizes how the context window fills during a session. On startup, before the user sends a single message, approximately 7,850+ tokens are already consumed by system-level content. The breakdown includes: the system prompt (~4,200 tokens), auto memory (~680 tokens), environment information (~280 tokens), deferred [[MCP]] tool names (~120 tokens), [[Skills]] descriptions (~450 tokens), global `CLAUDE.md` (~320 tokens), and project `CLAUDE.md` (~1,800 tokens).

This pre-loaded context establishes the baseline token overhead for every [[Claude Code]] session, directly affecting how much space remains for conversation history, file contents, and tool outputs. Understanding this breakdown is useful for cost estimation and for diagnosing why sessions hit context limits sooner than expected. Heavy use of [[MCP]] servers with many tools, verbose `CLAUDE.md` files, or numerous [[Skills]] definitions each contribute to the startup overhead.

Path-scoped rules in `CLAUDE.md` (rules that apply only within specific directory paths) are loaded lazily — they are added to the context only when the agent accesses a file within their scope, rather than at session startup. This deferred loading mechanism helps keep the initial context footprint smaller in large projects with many path-specific rules.

## Key Topics

- Interactive simulation of [[Context Window]] filling
- Startup token breakdown (total ~7,850+ before first message):
  - System prompt: ~4,200 tokens
  - Auto memory: ~680 tokens
  - Environment info: ~280 tokens
  - Deferred [[MCP]] tool names: ~120 tokens
  - [[Skills]] descriptions: ~450 tokens
  - Global CLAUDE.md: ~320 tokens
  - Project CLAUDE.md: ~1,800 tokens
- Baseline token overhead for cost estimation and context planning
- Path-scoped rules loaded lazily on file access (not at startup)
- Relationship to [[Source - Claude Code Cost Management|Claude Code Cost Management]]
