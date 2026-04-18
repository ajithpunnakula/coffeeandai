---
title: "Source - Claude Code Platforms and Integrations"
type: source
date: 2026-04-13
source_file: "raw/platforms-and-integrations.md"
tags: [claude-code, features]
---

# Source - Claude Code Platforms and Integrations

This page provides a decision matrix for choosing where to run [[Claude Code]] and what integrations to connect. All surfaces run the same underlying engine, but each is optimized for a different working style. The CLI is the most complete surface: it has the full feature set, the Agent SDK, computer use on macOS (Pro/Max), and third-party provider support — features that are CLI-only. The [[Claude Desktop App]] and IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web surface runs in [[Anthropic]]'s cloud so tasks continue after disconnection; mobile is a thin client into cloud sessions or local sessions via Remote Control, and can delegate to Desktop via Dispatch.

Platforms summarized: CLI (terminal workflows, scripting, remote servers — full feature set); Desktop (visual review, parallel sessions, managed setup — diff viewer, app preview, computer use, Dispatch on Pro/Max); [[VS Code Extension]] (working inside VS Code without switching to terminal — inline diffs, integrated terminal, file context); [[JetBrains Plugin]] (IntelliJ, PyCharm, WebStorm, others — diff viewer, selection sharing, terminal session); Web (long-running tasks, offline persistence — Anthropic-managed cloud); Mobile (starting and monitoring tasks away from computer — cloud sessions or Remote Control or Dispatch to Desktop).

Integrations covered: [[Claude in Chrome]] (browser automation with login-state access, for web app testing and form automation); GitHub Actions (CI pipeline automation for PR reviews, issue triage, scheduled maintenance); GitLab CI/CD (same for GitLab); Code Review (automatic review on every PR); Slack (responds to `@Claude` mentions, turns bug reports into PRs, runs on Anthropic cloud). For other tools, [[MCP]] servers and Desktop connectors enable connections to Linear, Notion, Google Drive, and custom internal APIs.

Remote and async modes are compared: Dispatch (mobile-to-Desktop, minimal setup, your machine runs Claude); Remote Control (drive a live CLI or VS Code session from web/mobile); Channels (push events from chat apps like Telegram/Discord or custom servers into a CLI session, using channel plugins or custom builds); Slack integration (mention-triggered, Anthropic cloud, requires [[Source - Claude Code on the Web]] enabled); Scheduled tasks (cron-style automation available in CLI, Desktop, and cloud).

## Key Topics

- CLI: most complete surface — Agent SDK, computer use, third-party providers are CLI-only
- [[Claude Desktop App]]: diff viewer, app preview, computer use, Dispatch (Pro/Max)
- [[VS Code Extension]]: inline diffs, integrated terminal, file context; stays within editor
- [[JetBrains Plugin]]: diff viewer, selection sharing; plugin bridges CLI session
- Web: Anthropic-managed cloud, persists after disconnect
- Mobile: thin client into cloud or local via Remote Control; Dispatch to Desktop
- Integrations: [[Claude in Chrome]], GitHub Actions, GitLab CI/CD, Code Review, Slack
- [[MCP]] servers and Desktop connectors for Linear, Notion, Google Drive, etc.
- Remote modes: Dispatch, Remote Control, Channels, Slack, Scheduled tasks
- Channels: push events from Telegram/Discord or custom servers; requires channel plugin
- Configuration sharing: [[CLAUDE.md File]], [[MCP]] servers, hooks shared across local surfaces
