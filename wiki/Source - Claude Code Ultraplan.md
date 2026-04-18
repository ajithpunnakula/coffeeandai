---
title: "Source - Claude Code Ultraplan"
type: source
date: 2026-04-13
source_file: "raw/plan-in-the-cloud-with-ultraplan.md"
tags: [claude-code, features]
---

# Source - Claude Code Ultraplan

[[Ultraplan]] is a research preview feature in [[Claude Code]] (requires v2.1.91 or later) that delegates a planning task to a cloud session running in [[Permission Modes|Plan Mode]], freeing the local terminal for other work while the plan is drafted remotely. It requires a Claude Code on the web account and a GitHub repository, and is not available when using [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]]. The cloud session runs in the user's default cloud environment on [[Anthropic]] infrastructure.

Ultraplan can be launched from the CLI in three ways: using the `/ultraplan` command followed by a prompt, including the keyword "ultraplan" anywhere in a normal prompt, or choosing "No, refine with Ultraplan on Claude Code on the web" when Claude finishes a local plan and shows the approval dialog. The command and keyword paths show a confirmation dialog before launching. If [[Remote Control]] is active, it disconnects when Ultraplan starts because both features occupy the claude.ai/code interface and only one can be connected at a time. The CLI shows a status indicator while the remote session works: `◇ ultraplan` (drafting), `◇ ultraplan needs your input` (clarifying question), or `◆ ultraplan ready` (plan complete).

Plan review happens in the browser at claude.ai. The review view supports inline comments on specific passages, emoji reactions to signal approval or concern, and an outline sidebar for navigation. After addressing comments, Claude presents a revised draft. Once satisfied, the user chooses where to execute: **Execute on the web** runs the plan in the same cloud session and produces a pull request; **Approve plan and teleport back to terminal** archives the cloud session and sends the plan to the waiting local terminal. In the terminal, three options appear: implement in the current conversation, start a new session with only the plan as context, or cancel and save the plan to a file.

## Key Topics

- Research preview; requires Claude Code v2.1.91+, Claude Code on the web account, and GitHub repository
- Not available on Amazon Bedrock, Google Vertex AI, or Microsoft Foundry
- Three launch paths: `/ultraplan` command, "ultraplan" keyword, or from local plan approval dialog
- Status indicator in CLI: drafting → needs input → ready
- Plan review UI: inline comments, emoji reactions, outline sidebar
- Execution choices: run on web (produces PR) or teleport plan back to terminal
- Terminal execution options: implement in current session, new session, or save to file
- Conflict with Remote Control: both use the claude.ai/code interface; only one active at a time
- `/tasks` command shows ultraplan entry with session link and Stop action
