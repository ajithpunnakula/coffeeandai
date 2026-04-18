---
title: "Slack Integration"
type: entity
tags: [tool, ci-cd]
sources: ["raw/claude-code-in-slack.md", "raw/platforms-and-integrations.md"]
---

# Slack Integration

The Slack Integration connects [[Claude Code]] to Slack workspaces via the Claude for Slack app. When a user mentions `@Claude` in a channel, the app analyzes the message for coding intent. If coding intent is detected, the request is routed to a Claude Code web session rather than a standard conversational Claude response. This routing is transparent to the user — the same `@Claude` mention handles both conversational and coding requests, with the app deciding which backend to use.

Two routing modes are available: "Code only" (all `@Claude` channel mentions go to Claude Code regardless of intent detection) and "Code + Chat" (intent detection determines routing). The app gathers thread context to assist with repository selection when multiple repos are configured. Progress is posted back to the thread with action buttons — "View Session" opens the live Claude Code web session, and "Create PR" surfaces the completed pull request. Interaction is channel-only; direct messages to Claude do not route to Claude Code sessions.

The integration is limited to GitHub repositories and does not support GitLab or other VCS providers. It relies on Claude Code [[Source - Claude Code on the Web|Web Sessions]] running on [[Anthropic]] cloud infrastructure, meaning it is subject to the same data-handling policies as other Anthropic-hosted sessions. Enterprises requiring traffic isolation should use the [[GitHub Actions Integration]] or [[GitLab CI-CD Integration]] with their own cloud providers instead. See [[Source - Claude Code in Slack]] for workspace setup and routing configuration.
