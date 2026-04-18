---
title: "Source - Claude Code Cost Management"
type: source
date: 2026-04-13
source_file: "raw/manage-costs-effectively.md"
tags: [claude-code, enterprise, configuration]
---

# Source - Claude Code Cost Management

[[Claude Code]] provides built-in cost tracking and a set of strategies for reducing token consumption. The `/cost` and `/stats` commands display token usage and cumulative spend for the current session. As a benchmark, average usage is approximately $13 per developer per active day, though this varies significantly based on task complexity, model selection, and use of multi-agent workflows. Workspace-level spend limits can be configured by administrators to cap costs across teams.

Several strategies reduce token consumption without sacrificing capability. Context management practices — such as using `/compact` to summarize long sessions and keeping `CLAUDE.md` files concise — directly reduce tokens sent per request. Model selection matters: using a smaller or less expensive model for simpler subtasks, reserving Opus for complex reasoning, can cut costs substantially. Reducing [[MCP]] server overhead (fewer connected servers, fewer exposed tools) lowers the per-session baseline from startup context.

[[Hooks]] can preprocess prompts or filter tool outputs before they enter the context, reducing the volume of tokens that reach the model. Adjusting the effort level (asking for lower-effort responses when appropriate) and delegating routine subtasks to [[Subagents]] running cheaper models are additional levers. Multi-agent teams via [[Subagents]] use approximately 7x more tokens than single-agent sessions, making task scoping critical for cost control in orchestrated workflows.

## Key Topics

- `/cost` and `/stats` commands for session spend tracking
- Benchmark: ~$13/developer/active day average
- Workspace-level spend limits for team cost governance
- Context management: `/compact`, concise `CLAUDE.md` files
- Model selection strategies for cost/quality tradeoffs
- Reducing [[MCP]] server overhead (fewer servers/tools)
- [[Hooks]] for prompt preprocessing and token reduction
- Effort level adjustment for lower-cost responses
- [[Subagents]] delegation to cheaper models for routine tasks
- Multi-agent teams use ~7x more tokens than single-agent sessions
- Relationship to [[Source - Claude Code Context Window Explorer|Claude Code Context Window Explorer]] for overhead visibility
