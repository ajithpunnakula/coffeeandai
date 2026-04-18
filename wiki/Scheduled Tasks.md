---
title: "Scheduled Tasks"
type: concept
tags: [automation, claude-code]
sources: ["raw/run-prompts-on-a-schedule.md", "raw/schedule-tasks-on-the-web.md", "raw/schedule-recurring-tasks-in-claude-code-desktop.md"]
---

# Scheduled Tasks

Scheduled Tasks in [[Claude Code]] come in three tiers with different scopes, persistence, and infrastructure. Understanding which tier to use depends on the desired lifetime, whether the user's machine needs to be running, and whether the task needs access to external services.

**Session-scoped** tasks use the `/loop` command and run within the current active session. They are backed by CronCreate/List/Delete tools that the [[Agentic Loop]] can call directly. Session tasks expire after 7 days and disappear when the session ends — suitable for time-boxed polling during a working session (e.g., checking a build every 5 minutes while iterating).

**Desktop local** tasks are configured via the [[Claude Desktop App]] Schedule page and run on the user's machine. The app must be open and running for tasks to fire; if the machine sleeps or the app is closed, missed runs are caught up on wake. These persist across sessions as long as the app is installed, and run with full access to the local filesystem, environment, and any locally configured [[MCP]] servers.

**Cloud** tasks run on [[Anthropic]] infrastructure at claude.ai/code, independent of the user's machine. They have a minimum interval of 1 hour, provision a fresh GitHub clone per run (using [[Git Worktrees]] for isolation), and support [[MCP]] connectors for accessing external services such as databases, APIs, or communication tools. By default, cloud tasks push to branches prefixed with `claude/` to avoid touching protected branches. Manage cloud tasks via the `/schedule` CLI command.

All three tiers share the same prompt-based interface — tasks are defined as natural language instructions that Claude executes on schedule — but differ substantially in operational characteristics. Cloud tasks are the most reliable for production automation; desktop tasks are convenient for personal workflows; session tasks are ephemeral helpers for in-the-moment automation. For a decision guide on choosing the right tier, see [[When to Use Scheduled Tasks]].
