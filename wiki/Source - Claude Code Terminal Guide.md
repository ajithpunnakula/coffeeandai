---
title: "Source - Claude Code Terminal Guide"
type: source
date: 2026-04-13
source_file: "raw/terminal-guide-for-new-users.md"
tags: [claude-code, getting-started]
---

# Source - Claude Code Terminal Guide

This guide is aimed at first-time terminal users and covers installing [[Claude Code]] from the command line on macOS, Linux, and Windows. It frames the terminal as an unfamiliar environment and walks through each prerequisite step explicitly. For users who prefer to avoid the terminal entirely, it mentions the [[Claude Desktop App]] as an alternative.

On macOS and Linux, installation uses a one-line shell script: `curl -fsSL https://claude.ai/install.sh | bash`. After installation, running `claude` launches [[Claude Code]] and prompts for browser-based login via `/login`. On Windows, installation requires first installing Git for Windows (needed internally by Claude Code), then running a PowerShell one-liner (`irm https://claude.ai/install.ps1 | iex`) — or a CMD alternative using `curl`. After a new PowerShell window is opened (so the PATH updates take effect), `claude` starts the tool with the same browser-based auth flow.

Once logged in, users can ask Claude questions in plain English, make simple file operations, or start new projects from descriptions. The guide provides starter prompts for building a webpage, organizing files by their content, and planning a new project. It also highlights that [[Claude Code]] is available beyond the CLI: [[VS Code Extension]] and [[JetBrains Plugin]] extensions, the [[Claude Desktop App]], web at claude.ai/code, and GitHub Actions / GitLab CI/CD.

Troubleshooting covers the most common installation failures: `command not found: claude` (PATH not updated — reload shell or add `~/.local/bin` to PATH); HTML returned instead of installer script (regional unavailability or network issue, with Homebrew as fallback on macOS); `irm is not recognized` on Windows (in CMD instead of PowerShell); SSL/TLS errors on older Windows 10 (force TLS 1.2 first); and `Claude Code on Windows requires git-bash` (Git not installed or path not found, with `CLAUDE_CODE_GIT_BASH_PATH` env var fix).

## Key Topics

- Target audience: first-time terminal users
- macOS/Linux install: `curl -fsSL https://claude.ai/install.sh | bash`
- Windows install: Git for Windows prerequisite, then `irm https://claude.ai/install.ps1 | iex` in PowerShell
- CMD alternative: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
- Browser-based authentication via `/login` on first run
- Basic usage: plain-English prompts, `Esc` to interrupt, `/help` for commands
- macOS/Linux troubleshooting: `command not found` (PATH), HTML error (region/network), Homebrew fallback
- Windows troubleshooting: `irm not recognized` (CMD vs PowerShell), SSL/TLS error (TLS 1.2 fix), Git Bash path
- Other surfaces: [[VS Code Extension]], [[JetBrains Plugin]], [[Claude Desktop App]], web, CI/CD
