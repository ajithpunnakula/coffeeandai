---
title: "Source - Claude Code in Slack"
type: source
date: 2026-04-13
source_file: "raw/claude-code-in-slack.md"
tags: [claude-code, ci-cd, automation]
---

# Source - Claude Code in Slack

[[Claude Code]] in Slack is built on top of the Claude for Slack app and adds intelligent routing to [[Claude Code]] on the web for coding-related requests. When `@Claude` is mentioned in a Slack channel, Claude analyzes the message to detect coding intent and, if found, creates a Claude Code session on claude.ai rather than responding as a standard chat assistant. This enables teams to delegate development work directly from Slack conversations without switching tools. The integration currently supports GitHub repositories only; GitLab and other platforms are not supported.

Two routing modes control behavior: "Code only" routes all @mentions to Claude Code sessions, while "Code + Chat" uses intent detection to route between Claude Code (for coding tasks) and Claude Chat (for general questions, writing, analysis). Users can override routing decisions with "Retry as Code" or switch back to Chat in either direction. Context for sessions is gathered from the full thread when Claude is @mentioned in a thread, or from recent channel messages when mentioned directly in a channel. Claude uses this context to select the appropriate repository from connected GitHub accounts. A "Change Repo" button allows correction if the wrong repository is selected. Sessions run under the individual user's Claude account, counting against their plan's rate limits and using repositories they have personally connected.

The session flow runs as: (1) @mention with coding request, (2) Claude detects intent, (3) Claude Code session created on claude.ai/code, (4) status updates posted to Slack thread, (5) completion summary with action buttons. Action buttons include "View Session" (opens full transcript in browser), "Create PR" (opens a pull request from session changes), "Retry as Code", and "Change Repo". Claude Code in Slack works only in channels (public or private), not in direct messages. Claude must be explicitly invited to each channel via `/invite @Claude`. For Enterprise and Team accounts, sessions are visible to the organization in the standard Claude Code sharing model.

Prerequisites are: Pro, Max, Teams, or Enterprise plan with Claude Code access; Claude Code on the web access enabled; at least one GitHub repository connected to Claude Code on the web; and Slack account linked to Claude account via the Claude app. Workspace administrators control app installation; Enterprise Grid organization admins control which workspaces have access.

## Key Topics

- Integration built on Claude for Slack app, adds routing to [[Claude Code]] on the web
- Trigger: `@Claude` mention in any Slack channel where Claude has been invited
- GitHub only: currently limited to GitHub repositories (not GitLab or others)
- Two routing modes: "Code only" (always Claude Code) vs. "Code + Chat" (intent detection)
- "Retry as Code" and "Switch to Chat" override buttons for incorrect routing
- Context gathering: full thread context when in thread, recent channel messages otherwise
- Automatic repository selection from connected GitHub accounts; "Change Repo" override
- Session flow: mention → intent detection → session creation → progress updates → summary
- Action buttons: View Session, Create PR, Retry as Code, Change Repo
- Channels only: does not work in direct messages (DMs)
- Must be explicitly invited per channel via `/invite @Claude`
- Sessions run under the individual user's account and plan limits
- User-level access: each user's own connected repos, own plan rate limits
- Workspace admin controls app installation; Enterprise Grid org admin controls workspace distribution
- For Enterprise/Teams: sessions visible to organization via standard [[Claude Code]] session sharing
