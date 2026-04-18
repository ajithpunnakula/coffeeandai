---
title: "Source - Claude Code Common Workflows"
type: source
date: 2026-04-13
source_file: "raw/common-workflows.md"
tags: [claude-code, features]
---

# Source - Claude Code Common Workflows

[[Claude Code]] Common Workflows is a recipe-oriented guide covering the most common everyday development tasks. It is organized as step-by-step walkthroughs with example prompts intended to be adapted directly. The guide covers: exploring new codebases (high-level overviews, finding relevant files, understanding architecture), fixing bugs (reproducing issues, tracing through code, writing failing tests first), refactoring (identifying code smells, incremental changes, validating behavior), writing tests (coverage analysis, test generation, test runner integration), creating pull requests (staging, commit messages, PR descriptions), and writing documentation (README generation, inline docs, API docs).

A significant portion covers input/output handling. [[Claude Code]] accepts image input (paste or drag-and-drop screenshots for UI verification tasks), `@file` references (Claude reads the referenced file before responding), and piped stdin (`cat error.log | claude`). URLs can be provided for documentation references; frequently-used domains can be allowlisted via `/permissions`. Extended thinking is triggered by the keyword `ultrathink` (or `think harder`, `megathink`) in a prompt — this allocates more processing budget for complex architectural or algorithmic problems.

Session management recipes are covered in detail. The session picker (`claude --resume`) shows a list of past sessions filterable by directory; `claude --continue` resumes the most recent. Named sessions can be created for structured work. Parallel sessions are enabled by [[Git Worktrees]]: each worktree is a separate directory, so separate Claude sessions can work on different branches simultaneously without context interference. The `/loop` command repeats a prompt on an interval within a session for quick polling or monitoring tasks.

Unix-style piping treats Claude as a composable CLI tool: pipe logs in, pipe output to other tools, run in non-interactive mode with `-p` for scripting. Output format can be controlled (`--output-format json`, `--output-format stream-json`, plain text). Notification [[Hooks]] can fire on task completion (e.g., send a desktop notification or Slack message when a long task finishes). Scheduling integrates with cloud scheduled tasks and desktop scheduled tasks for recurring automation.

## Key Topics

- Codebase exploration: high-level overviews, finding relevant files, tracing execution flows
- Bug fixing: reproducing issues, tracing root causes, test-first approach
- Refactoring and testing workflows with verification loops
- PR creation: staging changes, writing commit messages, opening PRs
- Documentation generation: READMEs, inline docs, API docs
- Image input for UI verification tasks
- `@file` references for targeted context injection
- Extended thinking via `ultrathink`/`think harder` keywords
- Session management: `--continue`, `--resume`, session picker, named sessions
- Parallel sessions via [[Git Worktrees]]
- Unix piping and non-interactive `-p` mode for scripting
- Output format control: plain text, JSON, stream-JSON
- Notification [[Hooks]] for task completion alerts
- `/loop` for in-session recurring prompts
- [[Scheduled Tasks|Scheduling]] via cloud and desktop scheduled tasks
