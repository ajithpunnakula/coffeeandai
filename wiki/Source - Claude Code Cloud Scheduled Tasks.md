---
title: "Source - Claude Code Cloud Scheduled Tasks"
type: source
date: 2026-04-13
source_file: "raw/schedule-tasks-on-the-web.md"
tags: [claude-code, automation]
---

# Source - Claude Code Cloud Scheduled Tasks

[[Claude Code]] cloud scheduled tasks run on [[Anthropic]]-managed infrastructure, making them independent of the user's machine. They are available to all Claude Code on the web users — Pro, Max, Team, and Enterprise — and keep working even when the computer is off. Typical use cases include reviewing open pull requests each morning, analyzing CI failures overnight, syncing documentation after PR merges, and running weekly dependency audits.

Tasks can be created from three entry points: the web UI at `claude.ai/code/scheduled`, the Desktop app Schedule page (via "New remote task"), or the CLI using the `/schedule` command. The creation flow collects a name, prompt, one or more GitHub repositories, a cloud environment (controlling network access, environment variables, and setup scripts), a schedule frequency, and [[MCP]] connectors. All currently connected MCP connectors are included by default and can be removed. Supported frequencies are Hourly, Daily, Weekdays, and Weekly; the minimum interval is 1 hour. Custom cron expressions (e.g., every 2 hours) can be set via `/schedule update` after creation. By default, Claude can only push to branches prefixed with `claude/`; the "Allow unrestricted branch pushes" toggle removes this restriction per repository.

Each run starts a fresh GitHub repository clone from the default branch, runs the configured setup script, and executes the prompt autonomously — there are no permission prompts during cloud runs. MCP connectors such as Slack, Linear, and Google Drive are available during each run. The run creates a new session in the session list where the user can review changes and open pull requests. Tasks can be triggered immediately via "Run now", paused without deletion, edited, or deleted from the task detail page. CLI management commands include `/schedule list`, `/schedule update`, and `/schedule run`.

## Key Topics

- Cloud infrastructure: runs without the user's machine, fresh GitHub clone per run
- Available on Pro, Max, Team, and Enterprise plans
- Three creation entry points: web UI, Desktop app, `/schedule` CLI command
- Repository selection with `claude/`-prefixed branch protection by default
- Cloud environments: network access, environment variables, setup scripts
- MCP connectors (Slack, Linear, Google Drive) included by default and configurable per task
- Minimum 1-hour interval; custom cron via `/schedule update`
- Autonomous execution — no permission prompts during runs
- Task management: Run now, pause/resume toggle, edit, delete
- CLI commands: `/schedule list`, `/schedule update`, `/schedule run`
- Comparison table: Cloud vs Desktop vs `/loop` scheduling
