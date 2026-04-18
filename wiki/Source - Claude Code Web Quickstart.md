---
title: "Source - Claude Code Web Quickstart"
type: source
date: 2026-04-13
source_file: "raw/get-started-with-claude-code-on-the-web.md"
tags: [claude-code, getting-started]
---

# Source - Claude Code Web Quickstart

[[Claude Code]] on the web runs on [[Anthropic]]-managed cloud infrastructure at claude.ai/code, eliminating local setup. It requires a GitHub repository: Claude clones it into an isolated VM, makes changes on a new branch, and pushes for review. Sessions persist across devices — a task started on a laptop is reviewable from a phone. It is currently in research preview for Pro, Max, and Team users, and Enterprise users with premium or Chat + Claude Code seats.

Setup is a one-time process with two paths. Browser path: visit claude.ai/code, install the Claude GitHub App granting repository access, then create a cloud environment (name, network access level, optional env vars, optional setup script). CLI path for existing `gh` CLI users: authenticate with `gh auth login`, sign into Claude with `/login`, then run `/web-setup` — this syncs the local `gh` token to the Claude account and creates a default Trusted-access environment. Organizations with Zero Data Retention cannot use `/web-setup`. The `--remote` and `--teleport` flags (and `/schedule`) require either connection method to be configured.

Starting a task involves selecting a repository and branch (multiple repositories can be added to one session), choosing a permission mode (Auto accept edits default, Plan mode available; Ask, Auto, and Bypass are not available in cloud sessions), and typing a task description. Each task runs in its own session and branch so parallel tasks are supported without interference. Reviewing changes uses the diff indicator (`+N -N`), a file list with per-file diffs, inline line-level comments that bundle into the next message, and a "Create PR" button offering full PR, draft PR, or GitHub compose. The session stays live after PR creation for further iteration.

Key use cases where the web surface excels: parallel tasks on separate branches without managing worktrees; repos not checked out locally (Claude clones fresh); tasks not requiring frequent steering; and codebase exploration without a local checkout. For work needing local config, tools, or environment, the CLI or Remote Control is a better fit.

## Key Topics

- Research preview: Pro, Max, Team, Enterprise (premium/Chat+Code seats)
- Requires GitHub; Claude clones repo into isolated VM per session
- Browser setup: install Claude GitHub App, create environment (network, env vars, setup script)
- CLI setup: `gh auth login` + `/login` + `/web-setup` to sync token and create environment
- Zero Data Retention orgs cannot use `/web-setup`
- Permission modes available: Auto accept edits, Plan (not Ask, Auto, or Bypass)
- Multiple repositories per session with independent branch selectors
- Parallel tasks in separate sessions and branches
- Diff review: `+N -N` indicator, file list, per-line inline comments bundled into next message
- "Create PR": full PR, draft PR, or GitHub compose with generated title/description
- Session persists after PR creation and after closing tab
- `--remote` flag to start/resume cloud sessions from terminal
- Best for: parallel tasks, uncloned repos, low-steering tasks, codebase exploration
