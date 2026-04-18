---
title: "Source - Claude Code Overview"
type: source
date: 2026-04-13
source_file: "raw/claude-code-overview.md"
tags: [claude-code, getting-started]
---

# Source - Claude Code Overview

[[Claude Code]] is [[Anthropic]]'s agentic coding tool that reads codebases, edits files, runs commands, and integrates with development tooling. It is available across five primary surfaces: the terminal CLI, [[VS Code Extension]] extension, [[JetBrains Plugin]] plugin, a standalone [[Claude Desktop App|Desktop App]], and the browser at claude.ai/code. Installation is available via a native installer (the recommended path, supporting macOS, Linux, WSL, and Windows), Homebrew, or WinGet. Native installs auto-update; Homebrew and WinGet require manual upgrade commands.

The overview catalogs the full surface area of what Claude Code can do: automating tedious tasks (tests, lint fixes, merge conflicts, release notes), building features and fixing bugs across multiple files, creating commits and pull requests via git, and connecting to external tools through the [[MCP]]. Customization is handled through [[CLAUDE.md File]] (project-level instructions Claude reads at session start), auto-memory (learnings Claude saves across sessions), [[Skills]] (reusable packaged workflows), and [[Hooks]] (shell commands that fire before or after Claude actions). Users can also spawn [[Subagents]] for parallel work and build fully custom agents with the Agent SDK.

Beyond the five primary surfaces, Claude Code integrates deeply with CI/CD and communication workflows. [[GitHub Actions Integration]] and [[GitLab CI-CD Integration]] support automated code review and issue triage. [[Source - Claude Code Code Review|GitHub Code Review]] enables automatic review on every PR. A [[Slack Integration]] integration routes bug reports from team chat directly to pull requests. Remote Control allows continuing a local session from any browser or phone. Scheduled tasks (cloud or desktop) run recurring jobs like morning PR reviews or weekly dependency audits. The web surface supports long-running tasks offloaded to Anthropic-managed infrastructure.

## Key Topics

- Installation methods: native installer, Homebrew, WinGet; platform coverage (macOS, Linux, WSL, Windows)
- Five primary surfaces: Terminal, VS Code, JetBrains, Desktop App, Web
- Core capabilities: file editing, git operations, test running, web search
- [[MCP]] connectivity to external services (Jira, Slack, Google Drive, custom tools)
- Customization: [[CLAUDE.md File]], auto-memory, Skills, Hooks
- [[Subagents]] and Agent SDK for orchestrated multi-agent workflows
- Scheduling: cloud scheduled tasks, desktop scheduled tasks, `/loop` command
- Cross-surface session continuity: Remote Control, Dispatch, `--teleport`
- CI/CD integrations: GitHub Actions, GitLab CI/CD, GitHub Code Review
- Slack integration for routing bug reports to PRs
