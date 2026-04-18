---
title: "Source - Claude Code Scheduled Tasks (Loop)"
type: source
date: 2026-04-13
source_file: "raw/run-prompts-on-a-schedule.md"
tags: [claude-code, automation]
---

# Source - Claude Code Scheduled Tasks (Loop)

[[Claude Code]] provides session-scoped scheduling via the `/loop` command and three underlying tools: `CronCreate`, `CronList`, and `CronDelete`. Tasks are tied to the current process and are automatically cleared when the session exits. This makes `/loop` suitable for in-session polling work — watching a deployment, babysitting a PR, or setting a one-time reminder — but not for durable automation that must survive restarts. For persistent scheduling, [[Anthropic]] recommends [[Source - Claude Code Cloud Scheduled Tasks|Cloud Scheduled Tasks]] or [[Source - Claude Code Desktop Scheduled Tasks|Desktop Scheduled Tasks]] instead.

The `/loop` command supports three invocation patterns. Supplying an interval and prompt (e.g., `/loop 5m check the deploy`) schedules a fixed cron-based task. Supplying only a prompt lets Claude choose a dynamic interval between 1 minute and 1 hour per iteration, adjusting cadence based on activity. Omitting both runs the built-in maintenance loop, which continues unfinished work, tends the current branch's pull request, and runs cleanup passes when nothing else is pending. A `loop.md` file at `.claude/loop.md` or `~/.claude/loop.md` can replace the built-in maintenance prompt with custom instructions.

Scheduled tasks use standard five-field cron expressions and are capped at 50 per session. A jitter mechanism adds a small deterministic offset to each task's fire time — up to 10% of the period (capped at 15 minutes) for recurring tasks, and up to 90 seconds for one-shot tasks at the top or bottom of the hour — to avoid simultaneous API spikes across sessions. All times are interpreted in local timezone. Recurring tasks automatically expire after seven days to prevent forgotten loops from running indefinitely.

On [[Amazon Bedrock]], [[Google Vertex AI]], and [[Microsoft Foundry]], dynamic interval loops fall back to a fixed 10-minute schedule, and bare `/loop` prints usage rather than starting the maintenance loop. The scheduler can be disabled entirely with the `CLAUDE_CODE_DISABLE_CRON=1` environment variable.

## Key Topics

- `/loop` command with fixed interval, dynamic interval, and bare (maintenance) modes
- `CronCreate`, `CronList`, `CronDelete` tools for programmatic task management
- `loop.md` file for customizing the default maintenance prompt (project-level and user-level)
- Session-scoped lifetime: tasks are gone on exit, no catch-up for missed fires
- Seven-day auto-expiry for recurring tasks
- Jitter to stagger API traffic across sessions
- Comparison table: Cloud vs Desktop vs `/loop` scheduling
- `CLAUDE_CODE_DISABLE_CRON=1` environment variable to disable the scheduler
- Cron expression reference (5-field, standard vixie-cron semantics)
- Limitations on Bedrock, Vertex AI, and Microsoft Foundry
