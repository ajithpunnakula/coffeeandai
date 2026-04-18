---
title: "Source - Week 15 April 6-10 2026"
type: source
date: 2026-04-17
source_file: "raw/week-15-april-6-10-2026.md"
tags: [changelog, claude-code, ultraplan, monitoring, automation]
---

Week 15 of [[Claude Code]] releases (v2.1.92 through v2.1.101) shipped four headline features between April 6 and 10, 2026: [[Ultraplan]] cloud planning, the Monitor tool with self-pacing `/loop`, `/team-onboarding`, and `/autofix-pr` from the terminal.

**[[Ultraplan]]** (research preview) lets users kick off plan mode in the cloud from their terminal, then review the result in the browser. Claude drafts the plan in a [[Claude Code]] web session while the local terminal stays free. Users can comment on individual sections, request revisions, and choose to execute remotely or send the plan back to the CLI. As of v2.1.101, the first run auto-creates a default cloud environment, removing the need for web setup. This bridges the gap between local CLI workflows and cloud-based [[Claude Code]] execution.

**Monitor tool** (v2.1.98) is a new built-in tool that spawns a background watcher and streams events into the conversation. Each event lands as a new transcript message that Claude reacts to immediately. Use cases include tailing training runs, watching PR CI status, or auto-fixing dev server crashes the moment they happen -- all without a Bash sleep loop holding the turn open. This pairs with `/loop`, which now self-paces: omit the interval and Claude schedules the next tick based on the task, or uses the Monitor tool to skip polling entirely. This represents a significant improvement to the [[Agentic Loop]] for long-running observation tasks.

**`/autofix-pr`** brings the PR auto-fix capability (first introduced on the web in Week 13) to the CLI. It infers the open PR for the current branch and enables auto-fix on [[Claude Code]] web in one step. Users push their branch, run the command, and walk away while Claude watches CI and review comments and pushes fixes until it is green.

**`/team-onboarding`** (v2.1.101) generates a teammate ramp-up guide from local [[Claude Code]] usage. Running it in a well-known project produces output that a new teammate can use to replay the setup instead of starting from defaults. This addresses the challenge of sharing [[CLAUDE.md File]] configurations, [[Skills]], [[Hooks]], and workflow knowledge across teams.

Other wins include: Focus view in flicker-free mode (Ctrl+O collapses to last prompt, diffstats, and response); guided [[Amazon Bedrock]] and [[Google Vertex AI]] setup wizards on the login screen; `/agents` tabbed layout with a Running tab showing live [[Subagents]]; default effort level set to `high` for API-key, Bedrock, Vertex, Foundry, Team, and Enterprise users; `/cost` per-model and cache-hit breakdown; `/release-notes` as an interactive version picker; status line `refreshInterval` setting; `CLAUDE_CODE_PERFORCE_MODE` for read-only file protection; OS CA certificate store trusted by default for enterprise TLS proxies; [[Amazon Bedrock]] Mantle support; hardened Bash tool permissions; and `UserPromptSubmit` hooks setting session titles.

## Key Topics

- [[Ultraplan]] cloud planning with CLI-to-web bridge and auto-provisioned environments
- Monitor tool for background event watching without polling loops
- Self-pacing `/loop` command integrated with Monitor tool
- `/autofix-pr` bringing web PR auto-fix to the CLI
- `/team-onboarding` for generating setup guides from local usage
- Guided setup wizards for [[Amazon Bedrock]] and [[Google Vertex AI]]
- `/agents` tabbed layout with live [[Subagents]] tracking
- Default effort level changes for various user tiers
- Hardened Bash tool [[Permission Modes]] for escaped flags and compound commands
- `UserPromptSubmit` [[Hooks]] for session title management
- OS CA certificate store for enterprise TLS proxy support
- [[Prompt Caching]] visibility via `/cost` cache-hit breakdown
