---
title: "Source - Claude Code Best Practices"
type: source
date: 2026-04-13
source_file: "raw/best-practices-for-claude-code.md"
tags: [claude-code, getting-started]
---

# Source - Claude Code Best Practices

The central constraint that governs all [[Claude Code]] best practices is the [[Context Window]]: it fills up fast, and LLM performance degrades as it fills. A single debugging session or codebase exploration can consume tens of thousands of tokens. The guide opens by establishing this constraint clearly, then organizes all subsequent advice around mitigating context pressure while maximizing output quality.

The recommended four-phase workflow separates concerns: **Explore** (use Plan Mode to read files and understand the codebase without making changes), **Plan** (ask Claude to produce a detailed implementation plan, editable via Ctrl+G), **Implement** (switch to Normal Mode and execute against the plan with verification criteria), and **Commit** (ask Claude to write a descriptive commit message and open a PR). This sequencing avoids the failure mode of Claude jumping to code before understanding the problem. Plan Mode is most valuable when scope is unclear or changes span multiple files; it adds overhead and should be skipped for small, clear tasks.

[[CLAUDE.md File]] authoring is covered in depth. The key principle is conciseness: every line should be something Claude can't infer from code alone, or something that would cause mistakes if absent. Effective CLAUDE.md content includes bash commands, code style rules that differ from defaults, testing instructions, repository etiquette, and architectural decisions. Bad CLAUDE.md content includes API documentation, standard conventions Claude already knows, and file-by-file descriptions. CLAUDE.md files can import other files using `@path/to/file` syntax and can be placed at `~/.claude/CLAUDE.md` (global), project root (team-shared via git), `CLAUDE.local.md` (personal, gitignored), parent directories (monorepo support), or child directories (pulled in on demand).

The guide covers environment configuration ([[Hooks]], [[Skills]], [[Subagents]], [[Plugins]], [[MCP]] servers, CLI tools like `gh` and `aws`) and scales up to parallelism patterns: non-interactive mode (`claude -p`), multiple sessions via git worktrees, fan-out scripts that spawn parallel Claude instances, and the Writer/Reviewer pattern (one agent writes, another reviews in a separate context). Context management tactics include `/clear` (fresh context), `/compact` (compress with a focus), and delegating to [[Subagents]] (which get their own isolated context window).

## Key Topics

- Central constraint: [[Context Window]] fill degrades performance
- Four-phase workflow: Explore → Plan → Implement → Commit
- Plan Mode for read-only exploration before coding
- [[CLAUDE.md File]] authoring: what to include, what to exclude, import syntax, placement options
- Providing verification criteria (tests, screenshots, expected outputs)
- Permission configuration: [[Permission Modes|Auto Mode]], permission allowlists, [[Sandboxing]]
- Environment setup: [[Hooks]], [[Skills]], [[Subagents]], [[Plugins]], [[MCP]] servers
- Context management: `/clear`, `/compact`, [[Subagents]] for isolation
- Scaling patterns: non-interactive mode, git worktrees for parallel sessions
- Writer/Reviewer pattern using two separate Claude contexts
- Communication tips: specificity, rich content via `@` references, iterative steering
