---
title: "Source - Claude Code Memory Systems"
type: source
date: 2026-04-13
source_file: "raw/how-claude-remembers-your-project.md"
tags: [claude-code, features, configuration]
---

# Source - Claude Code Memory Systems

[[Claude Code]] carries knowledge across sessions through two complementary mechanisms: [[CLAUDE.md File]] files (written by humans, providing persistent instructions) and [[Auto Memory]] (written by Claude itself, accumulating learnings from corrections and preferences). Both are loaded at the start of every session. Claude treats them as context rather than enforced configuration, so specificity and conciseness directly affect how reliably instructions are followed.

[[CLAUDE.md File]] files can exist at four scopes: managed policy (organization-wide, at OS-level system paths), project instructions (`./CLAUDE.md` or `./.claude/CLAUDE.md`, shared via version control), user instructions (`~/.claude/CLAUDE.md`, personal across all projects), and local instructions (`./CLAUDE.local.md`, personal per-project, gitignored). All discovered CLAUDE.md files along the directory tree are additive — concatenated rather than overriding each other. Files at and above the working directory load at launch; subdirectory CLAUDE.md files load lazily when Claude reads files in those subdirectories. The `@path` import syntax pulls in additional files (README, package.json, docs) at session start, with a maximum of 5 hops of recursive imports. HTML comments in CLAUDE.md files are stripped before injection into context, allowing maintainer notes without consuming tokens. The `/init` command generates a starting CLAUDE.md by analyzing the codebase.

For large projects, `.claude/rules/` organizes instructions into topic-specific files (e.g., `testing.md`, `api-design.md`). Rules support `paths` frontmatter for path-scoped loading — a rule with `paths: ["*.ts"]` only loads when Claude works with TypeScript files, reducing noise and saving context. This is distinct from [[Skills]], which load only when invoked or deemed relevant, making them better for task-specific or optional reference material.

[[Auto Memory]] stores Claude-written notes at `~/.claude/projects/<project>/memory/MEMORY.md`. The first 200 lines or 25KB are loaded each session. Claude writes to auto memory when it makes mistakes, discovers patterns, or learns preferences during a session. [[Subagents]] can also maintain their own separate auto memory. Best practices for CLAUDE.md: target under 200 lines, use markdown headers and bullets, write specific verifiable instructions ("Use 2-space indentation" not "Format code properly"), and use `claudeMdExcludes` in monorepos to skip other teams' CLAUDE.md files.

## Key Topics

- Two memory mechanisms: CLAUDE.md (human-authored) and Auto Memory (Claude-authored)
- CLAUDE.md scope hierarchy: managed policy > project > user > local
- Additive loading: all discovered files concatenated, not overriding
- Lazy loading: subdirectory CLAUDE.md files load when those dirs are accessed
- `@path` import syntax (max 5 hops) for pulling in external files
- HTML comments in CLAUDE.md stripped from context (maintainer notes)
- `.claude/rules/` for modular, path-scoped instructions
- `paths` frontmatter in rules for conditional loading by file type
- Auto Memory: `~/.claude/projects/<project>/memory/MEMORY.md`, first 200 lines/25KB
- Subagents can maintain their own separate auto memory
- Best practices: under 200 lines, specific and concrete, `claudeMdExcludes` for monorepos
- `/init` command for generating starting CLAUDE.md from codebase analysis
