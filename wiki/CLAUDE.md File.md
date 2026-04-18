---
title: "CLAUDE.md File"
type: concept
tags: [configuration, claude-code]
sources: ["raw/how-claude-remembers-your-project.md", "raw/best-practices-for-claude-code.md", "raw/explore-the-claude-directory.md"]
---

# CLAUDE.md File

The CLAUDE.md file is a per-project markdown file that [[Claude Code]] automatically loads into every session, providing persistent instructions without requiring the user to repeat themselves. It serves as the primary mechanism for encoding project-specific conventions, workflows, and constraints that should always be active. At startup, the project CLAUDE.md contributes approximately 1,800 tokens to the [[Context Window]], making it one of the largest startup cost items.

CLAUDE.md files exist at four scopes that are additive — all levels are concatenated rather than any one overriding another. The **managed policy** scope is deployed org-wide via MDM and is read-only to users. The **project** scope lives at `./CLAUDE.md` or `./.claude/CLAUDE.md` and is typically checked into version control so the whole team benefits. The **user** scope at `~/.claude/CLAUDE.md` holds personal preferences that apply across all projects. The **local** scope at `./CLAUDE.local.md` is gitignored and suitable for machine-specific or personal overrides on a shared project.

Files support an `@path` import syntax for composing multiple markdown files together, with a maximum depth of 5 hops. This allows large projects to split instructions by domain (e.g., `@./docs/coding-conventions.md`) while keeping the root CLAUDE.md as an index. Best practices from [[Source - Claude Code Best Practices]] recommend keeping the total under 200 lines, writing instructions that are specific and concrete (not vague principles), and pruning aggressively — stale or redundant instructions waste tokens and can confuse [[Claude Code]].

The CLAUDE.md file works in concert with other memory systems. [[Auto Memory]] provides a dynamic, session-updated complement for evolving facts. [[Skills]] in `.claude/skills/` extend Claude's capabilities with reusable workflows. The [[.claude Directory]] houses all of these alongside subagent definitions, hooks configuration, and plugin data. Path-scoped rules within CLAUDE.md (e.g., rules that only apply when working in `src/api/`) are loaded on demand when matching files are accessed, reducing startup token cost.

## See also

- [[Auto Memory]]
- [[Skills]]
- [[.claude Directory]]
- [[Context Window]]
- [[Claude Code]]
