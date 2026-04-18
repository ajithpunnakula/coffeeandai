---
title: "Git Worktrees"
type: concept
tags: [features, claude-code]
sources: ["raw/common-workflows.md", "raw/use-claude-code-desktop.md", "raw/create-custom-subagents.md"]
---

# Git Worktrees

Git worktrees are a native git mechanism that creates additional working directories linked to the same repository, each checked out to its own branch. [[Claude Code]] uses worktrees extensively as an isolation primitive — any time multiple agents, sessions, or tasks need to work on the same codebase without interfering with each other, worktrees provide branch-level separation without cloning the full repository.

The `--worktree` CLI flag creates an isolated worktree at `.claude/worktrees/<name>`, branching from `origin/HEAD`. Several [[Claude Code]] subsystems use this automatically: the [[Claude Desktop App]] creates a worktree per parallel session so simultaneous work on the same repo doesn't conflict; [[Subagents]] accept an `isolation: worktree` setting that wraps each agent run in its own worktree; [[Agent Teams]] provision per-teammate worktrees so orchestrators and subagents can make independent commits; [[Scheduled Tasks]] create a fresh worktree per run for cloud-side execution; and [[Remote Control]] server mode uses `--spawn worktree` to isolate incoming remote connections.

A key practical consideration is secrets and gitignored files. Worktrees by definition only contain tracked files — `.env`, local credentials, and other gitignored files are absent. The `.worktreeinclude` file (using gitignore syntax, placed in the repo root) specifies which gitignored files should be copied into newly created worktrees. This allows essential local configuration to propagate without committing sensitive files.

Worktrees pair naturally with [[Checkpointing]]: a worktree branch can be snapshotted at any point, enabling rollback without affecting the main branch. They also interact with branch strategy — since each worktree is a real branch, [[Agent Teams]] can open PRs from their respective worktree branches, giving humans a clean diff to review per agent's contribution.
