---
title: "Subagents"
type: concept
tags: [extensions, claude-code]
sources: ["raw/create-custom-subagents.md", "raw/extend-claude-code.md", "raw/best-practices-for-claude-code.md", "raw/subagents-in-the-sdk.md"]
---

# Subagents

Subagents are specialized AI assistants that run in their own isolated [[Context Window]] with custom system prompts, restricted tool sets, dedicated [[Permission Modes]], and configurable model selection. They allow a primary [[Claude Code]] session to delegate focused subtasks — keeping the main context clean and enabling parallel, specialized work.

Three built-in subagents ship with [[Claude Code]]. **Explore** uses Claude Haiku with read-only file access tools for fast codebase navigation. **Plan** is also read-only and suited for research and planning tasks that shouldn't have side effects. **General-purpose** has access to all tools and handles complex multi-step tasks. Custom subagents are defined as `AGENT.md` files in `.claude/agents/`. Key frontmatter fields include: `tools` and `disallowedTools` (allowlist/denylist of tool names), `model` (override the default model), `permissionMode` (set an autonomous level independently of the parent), `maxTurns` (cap execution length), `skills` (which [[Skills]] the subagent can invoke), `mcpServers` (dedicated [[MCP]] server connections), `hooks` (subagent-specific [[Hooks]]), and `memory` (persist facts across sessions).

A critical architectural constraint: subagents cannot spawn other subagents, preventing infinite nesting and runaway token consumption. For tasks requiring multiple parallel agents, [[Agent Teams]] provides a different coordination model. Worktree isolation is available via `isolation: worktree`, which gives the subagent its own [[Git Worktrees|git worktree]] so its file changes are fully independent of the parent session. Subagents are managed via the `/agents` command and can run in the background (indicated by a `background: true` flag), reporting results when complete.

Subagents are a key cost-management tool: delegating a token-intensive search task to an Explore subagent (Haiku) preserves the main session's context and avoids paying Sonnet/Opus rates for simple lookups. They also provide a security boundary — a subagent's restricted `tools` list prevents it from taking actions outside its defined scope, even if its context is manipulated. Together with [[Skills]] and [[Plugins]], subagents form the three pillars of [[Claude Code]]'s extension and automation layer.

## See also

- [[Agent Teams]]
- [[Skills]]
- [[Plugins]]
- [[Hooks]]
- [[Permission Modes]]
- [[Context Window]]
- [[Git Worktrees]]
