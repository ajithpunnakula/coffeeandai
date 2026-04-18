---
title: "Source - Claude Code Desktop Quickstart"
type: source
date: 2026-04-13
source_file: "raw/get-started-with-the-desktop-app.md"
tags: [claude-code, getting-started]
---

# Source - Claude Code Desktop Quickstart

The Claude Desktop app provides [[Claude Code]] with a graphical interface — no terminal required. It is available for macOS (universal Intel/Apple Silicon build) and Windows (x64 and ARM64); Linux is not currently supported. A Pro, Max, Team, or Enterprise subscription is required. The app bundles Claude Code internally, so Node.js and a separate CLI install are not needed to use the Code tab; to also use `claude` from the terminal, the CLI must be installed separately.

The app has three tabs: Chat (general conversation, no file access), Cowork (autonomous background agent in a cloud VM), and Code (interactive coding assistant with local file access). The quickstart focuses on the Code tab. Starting a session involves choosing an environment — Local (your machine, must select a project folder), Remote (Anthropic cloud, same infrastructure as [[Source - Claude Code on the Web]], continues if app closes), or SSH (remote machine with Claude Code pre-installed). After selecting a folder, choose a model (locked once the session starts) and send the first task.

By default, the Code tab starts in Ask permissions mode, so Claude proposes changes and waits for approval before applying them. Users see a diff view per change with accept/reject buttons. The diff indicator (`+N -N`) opens a file-by-file diff view with per-line commenting and a "Review code" button for Claude self-review. Parallel sessions can be opened from the sidebar, each with [[Git Worktrees]] isolation. Scheduled tasks can run Claude on a recurring basis. Plugins add skills, agents, [[MCP]] servers, and more via the `+` button.

The Desktop app shares configuration with the CLI — [[CLAUDE.md File]] files, [[MCP]] servers, hooks, skills, and settings are shared. Both can run simultaneously on the same project. The full CLI feature comparison (flags, CLI-only features) is documented in the "CLI comparison" section of the desktop reference page.

## Key Topics

- macOS and Windows only (no Linux); Pro/Max/Team/Enterprise subscription required
- Three tabs: Chat, Cowork (cloud background agent), Code (interactive, local files)
- Bundles Claude Code — no separate Node.js/CLI install needed for the app
- Environment choices: Local, Remote (Anthropic cloud), SSH
- Model selection locked after session start
- Default permission mode: Ask permissions (propose + wait for approval)
- Diff view per change with accept/reject; `+N -N` indicator opens full diff viewer
- Per-line commenting and "Review code" for Claude self-evaluation
- Parallel sessions with [[Git Worktrees]] isolation
- Scheduled tasks for recurring automation
- Plugin installation via `+` button (skills, agents, [[MCP]] servers)
- Shared config with CLI: [[CLAUDE.md File]], [[MCP]] servers, hooks, skills, settings
- Remote sessions use same infrastructure as [[Source - Claude Code on the Web]]
