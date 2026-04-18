---
title: "When to Use Scheduled Tasks"
type: analysis
date: 2026-04-13
tags: [automation, claude-code]
---

# When to Use Scheduled Tasks

A decision guide for choosing the right [[Scheduled Tasks]] tier in [[Claude Code]] — or whether to use scheduling at all.

## Use `/loop` (session-scoped) when…

- You need **ephemeral, in-the-moment polling** — watching a deployment, babysitting CI checks, or setting a one-time reminder during a working session.
- The task only matters while you are actively working.
- You want Claude to **dynamically adjust the interval** based on activity (1 min – 1 hour).

**Don't use `/loop` when** the task must survive a session restart or run while you're away. Tasks vanish on exit and have no catch-up mechanism ([[Source - Claude Code Scheduled Tasks (Loop)]]).

## Use Desktop local tasks when…

- The task needs **full local filesystem access** or locally configured [[MCP]] servers.
- You want a **personal workflow** that runs while your machine is on (e.g., a morning code review).
- You need the task to **persist across sessions** without cloud infrastructure.

**Don't use Desktop local tasks when** reliability matters. Tasks only fire if the Desktop app is open and the machine is awake. A task scheduled for 9 AM might actually run at 11 PM if the machine was asleep all day — write prompts defensively ([[Source - Claude Code Desktop Scheduled Tasks]]).

## Use Cloud tasks when…

- The task must run **regardless of whether your machine is on** — overnight CI analysis, daily PR reviews, weekly dependency audits, post-merge documentation syncs.
- You need the **most reliable** execution guarantee.
- The task works against a **GitHub repository** and optional [[MCP]] connectors (Slack, Linear, Google Drive).

**Don't use Cloud tasks when** you need sub-hourly intervals (minimum is 1 hour), or the task requires access to local files, tools, or environments that aren't available via GitHub or MCP connectors ([[Source - Claude Code Cloud Scheduled Tasks]]).

## When not to use a scheduler at all

The wiki's current sources focus on Claude Code scheduling and don't cover general software architecture patterns. That said, the scheduling tiers point to cases where scheduling is the wrong tool:

- **Event-driven work**: If the task should run in response to something happening (a PR merge, a Slack message, a webhook), use [[Hooks]] or [[Channels]] instead of polling on a schedule.
- **One-shot tasks**: If you just need something done once right now, run it interactively rather than scheduling it.
- **Sub-minute latency**: None of the tiers support intervals below 1 minute; real-time needs require a different architecture.
- **Tasks requiring human judgment mid-run**: Cloud tasks run autonomously with no permission prompts. Desktop tasks in Ask mode stall until the user responds. If the task frequently needs human input, interactive use is a better fit.

## Summary table

| Criterion | `/loop` | Desktop local | Cloud |
|---|---|---|---|
| Survives session end | No | Yes | Yes |
| Requires machine on | Yes | Yes | No |
| Minimum interval | 1 min | ~15 min | 1 hour |
| Local file access | Yes | Yes | No |
| MCP connectors | Session MCP | Local MCP | Cloud MCP |
| Catch-up on missed runs | None | One run on wake | N/A (always on) |
| Best for | In-session polling | Personal workflows | Reliable automation |
