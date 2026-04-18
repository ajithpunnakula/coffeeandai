---
title: "Source - Claude Code on the Web"
type: source
date: 2026-04-13
source_file: "raw/use-claude-code-on-the-web.md"
tags: [claude-code, features]
---

# Source - Claude Code on the Web

[[Claude Code]] on the web runs on [[Anthropic]]-managed cloud infrastructure at claude.ai/code, in research preview for Pro, Max, Team (and Enterprise with premium or Chat + Claude Code seats). Sessions run in fresh VMs with the repository cloned; they persist when the browser tab is closed and can be monitored from the Claude mobile app. GitHub access is established either via the Claude GitHub App (per-repo scope, required for Auto-fix) or via `/web-setup` in the CLI (syncs the local `gh` CLI token).

The cloud environment comes with an extensive pre-installed toolchain: Python 3.x (pip, poetry, uv, pytest, ruff), Node.js 20/21/22 via nvm (npm, yarn, pnpm, bun, eslint, prettier), Ruby 3.1–3.3, PHP 8.4, OpenJDK 21, Go (latest stable), Rust, GCC/Clang, Docker with Compose, PostgreSQL 16, Redis 7.0, and common utilities (git, jq, yq, ripgrep, tmux). Resource ceilings are approximately 4 vCPUs, 16 GB RAM, and 30 GB disk. The `gh` CLI is not pre-installed; install it via a setup script and provide a `GH_TOKEN` env var. The `check-tools` command (cloud-only) reports exact versions.

Environment configuration controls network access (None, Trusted with package registry allowlist, or Open), environment variables (`.env` format, visible to environment editors — no dedicated secrets store yet), and a setup script (Bash, runs as root on Ubuntu 24.04 before Claude Code launches, only on new sessions). Setup scripts differ from [[CLAUDE.md File]]-defined SessionStart hooks: scripts are cloud-environment-scoped, hooks are repo-scoped and run on every session including resumed ones. [[MCP]] servers and hooks committed to the repo's `.mcp.json` and `.claude/settings.json` are available; user-level `~/.claude/settings.json` settings are not.

Session mobility is supported via `--remote` (starts or resumes a cloud session from the terminal) and `--teleport` (hands off a local terminal session to the cloud). Auto-fix PRs respond automatically to CI failures and PR review comments using the GitHub App webhook; this requires the GitHub App (not the `/web-setup` token method). Sessions can be archived or deleted from the sidebar.

## Key Topics

- Research preview: Pro, Max, Team, and Enterprise with premium/Chat+Code seats
- GitHub authentication: GitHub App (per-repo, required for Auto-fix) vs. `/web-setup` CLI sync
- Pre-installed tools: Python, Node.js 20/21/22, Ruby, PHP, Java, Go, Rust, Docker, PostgreSQL 16, Redis 7.0
- Resource limits: 4 vCPUs, 16 GB RAM, 30 GB disk per session
- Network access levels: None, Trusted (package registries), Open
- Environment variables in `.env` format; no dedicated secrets store
- Setup scripts: Bash, root, Ubuntu 24.04, run only on new sessions
- Setup scripts vs. SessionStart hooks: environment-scoped vs. repo-scoped
- Repo-committed config (`.mcp.json`, `.claude/settings.json`) available; user `~/.claude/` is not
- `--remote` flag: start/resume cloud sessions from terminal
- `--teleport` flag: hand off local session to cloud
- Auto-fix PRs: requires GitHub App webhook, not `/web-setup` token
- Session persistence after tab close; monitoring via Claude mobile app
- Zero Data Retention organizations cannot use `/web-setup` or cloud sessions
