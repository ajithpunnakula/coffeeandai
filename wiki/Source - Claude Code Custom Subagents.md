---
title: "Source - Claude Code Custom Subagents"
type: source
date: 2026-04-13
source_file: "raw/create-custom-subagents.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Custom Subagents

[[Subagents]] in [[Claude Code]] are specialized AI assistants that run in their own isolated context window with custom system prompts, tool restrictions, permission modes, and model selection. When Claude encounters a task matching a subagent's description, it delegates to that subagent, which works independently and returns only a summary — keeping exploration, file reads, and intermediate output out of the main conversation context. Subagents cannot spawn other subagents (preventing infinite nesting), but the parent agent can run multiple subagents for parallel work.

Claude Code ships three built-in subagents: Explore (uses Haiku, read-only tools, optimized for fast codebase search and file discovery), Plan (inherits parent model, read-only tools, used during plan mode for research before presenting a plan), and General-purpose (inherits parent model, all tools, for complex multi-step tasks). Additional helper agents include statusline-setup (Sonnet, for `/statusline` configuration) and Claude Code Guide (Haiku, for answering questions about Claude Code features). Custom subagents can be created via `/agents` manager or written directly as Markdown files with YAML frontmatter.

Subagent scope hierarchy (highest to lowest priority): managed settings (organization-wide) > `--agents` CLI flag (current session only) > `.claude/agents/` (project, committable to version control) > `~/.claude/agents/` (personal, all projects) > plugin `agents/` directory. Frontmatter fields include `tools` / `disallowedTools` (tool access), `model` (model selection, e.g., `haiku` for cost control), `permissionMode` (auto/default/plan), `maxTurns` (turn limit), `skills` (preloaded skills — fully loaded at subagent launch, not on-demand), `mcpServers` (MCP connections), `hooks` (event handlers), `memory` (persistent memory directory scope), `background` (for background agents), and `isolation` (set to `"worktree"` for git worktree isolation).

The `/agents` command opens a tabbed interface (Running tab for live subagents, Library tab for creating/editing/deleting). Running `claude agents` from the command line lists all configured subagents grouped by source. Subagents preload skills specified in their `skills:` field at launch — unlike the main session where skills load on demand, subagent skills are fully in context from the start. The `isolation: "worktree"` option creates a separate git worktree for each subagent invocation, providing filesystem isolation for parallel work.

## Key Topics

- Built-in subagents: Explore (Haiku, read-only), Plan (read-only research), General-purpose (all tools)
- `/agents` manager: Running and Library tabs
- Subagent Markdown file format with YAML frontmatter
- Key frontmatter fields: `tools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `isolation`
- Scope hierarchy: managed > CLI flag > project > user > plugin
- Skills in subagents are preloaded at launch (not on-demand)
- Subagents cannot spawn other subagents
- `isolation: "worktree"` for git worktree isolation
- Persistent memory via `memory` field
- Cost control via model selection (Haiku for faster/cheaper subagents)
