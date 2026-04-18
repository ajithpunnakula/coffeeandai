---
title: "Source - Week 13 March 23-27 2026"
type: source
date: 2026-04-17
source_file: "raw/week-13-march-23-27-2026.md"
tags: [changelog, claude-code, permissions, computer-use, hooks]
---

Week 13 of [[Claude Code]] releases (v2.1.83 through v2.1.85) introduced six features between March 23 and 27, 2026. The headline additions are Auto mode, [[Computer Use]] in the Desktop app, and PR auto-fix on the web.

**Auto mode** is a new [[Permission Modes]] option that sits between manually approving every action and running with `--dangerously-skip-permissions`. A classifier evaluates each permission prompt: safe edits and commands run automatically while destructive or suspicious actions are blocked and surfaced to the user. It can be activated by cycling with Shift+Tab or set as the default in `.claude/settings.json`. This represents [[Anthropic]]'s approach to balancing developer productivity with safety guardrails.

**[[Computer Use]]** arrived in the [[Claude Desktop App]], allowing Claude to control the user's actual desktop: opening native apps, clicking through the iOS simulator, driving hardware control panels, and verifying changes on screen. It is off by default and asks permission before each action, targeting use cases where there is no API available -- proprietary tools, GUI-only applications, and end-to-end verification workflows.

**PR auto-fix** on [[Claude Code]] web lets users toggle automatic CI failure resolution when opening a pull request. Claude watches the CI pipeline, fixes failures and lint nits, and pushes until the PR is green, eliminating the need to babysit a PR through multiple rounds of fixes. This feature works within the cloud-based [[Claude Code]] environment.

**Transcript search** (v2.1.83) added the ability to press `/` in transcript mode to search conversations, with `n`/`N` to step through matches. This addresses the challenge of finding specific commands or outputs in long [[Agentic Loop]] sessions.

**PowerShell tool** (v2.1.84, preview) gave Windows users a native PowerShell tool alongside Bash, enabling cmdlets, object piping, and Windows-native paths without translation through Git Bash. It is opt-in via an environment variable.

**Conditional [[Hooks]]** (v2.1.85) added an `if` field to hooks using permission rule syntax, so a hook like a pre-commit check only fires for matching tool calls (e.g., `Bash(git commit *)`) rather than every Bash invocation, reducing process overhead in busy sessions.

Other notable improvements include public `userConfig` for [[Plugins]] (with keychain-backed secrets), pasted image chips, `managed-settings.d/` drop-in directory for layered policy fragments, `CwdChanged` and `FileChanged` hook events, `initialPrompt` frontmatter for agents, external editor support via Ctrl+X Ctrl+E, and an idle-return nudge to `/clear` after 75+ minutes.

## Key Topics

- Auto mode as a new [[Permission Modes]] option with classifier-based approval
- [[Computer Use]] landing in the [[Claude Desktop App]]
- PR auto-fix for automated CI failure resolution on [[Claude Code]] web
- Transcript search for navigating long conversations
- Native PowerShell tool for Windows users
- Conditional [[Hooks]] with `if` field for scoped execution
- Plugin `userConfig` with keychain-backed secrets for [[Plugins]]
- `managed-settings.d/` drop-in directory for enterprise policy layering
- `CwdChanged` and `FileChanged` hook events
- `initialPrompt` frontmatter for [[Subagents]] and agents
- [[VS Code Extension]] improvements including rate limit banner
