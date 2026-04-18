---
title: "Source - Claude Code Desktop Scheduled Tasks"
type: source
date: 2026-04-13
source_file: "raw/schedule-recurring-tasks-in-claude-code-desktop.md"
tags: [claude-code, automation]
---

# Source - Claude Code Desktop Scheduled Tasks

[[Claude Code]] Desktop offers a Schedule page where users can create and manage recurring tasks without keeping an interactive session open. Desktop tasks come in two kinds: **local tasks** run on the user's machine with full access to local files and tools (but require the Desktop app to be open and the computer awake), while **remote tasks** run on [[Anthropic]]-managed cloud infrastructure and keep running even when the machine is off. Both kinds appear in the same task grid. This page focuses on local tasks; remote tasks are covered in [[Source - Claude Code Cloud Scheduled Tasks]].

Tasks are configured with a name, description, prompt, and frequency. Preset frequency options include Manual (on-demand only), Hourly, Daily, Weekdays, and Weekly. For custom intervals not covered by the preset dropdown — such as every 15 minutes or the first of each month — users can ask Claude in any Desktop session in natural language. Each local task gets a fixed deterministic delay of up to 10 minutes after its scheduled time to stagger API traffic. When a task fires, a desktop notification appears and the new session shows under a "Scheduled" section in the sidebar. The worktree toggle in the prompt input gives each run its own isolated [[Git Worktrees|Git worktree]], avoiding conflicts with the working directory.

Missed-run behavior is designed to be forgiving: when the app starts or the computer wakes, Desktop checks whether each task missed any runs in the last seven days and starts exactly one catch-up run for the most recently missed time, discarding anything older. Users should write prompts defensively — a task scheduled for 9 AM might run at 11 PM if the machine was asleep all day. Per-task permission modes are supported; tasks running in Ask mode stall on unapproved tool calls until the user responds via the sidebar.

Task definitions are stored on disk at `~/.claude/scheduled-tasks/<task-name>/SKILL.md` (or under `CLAUDE_CONFIG_DIR` if set), using YAML frontmatter for name and description with the prompt as the body. Edits to this file take effect on the next run. Schedule, folder, model, and enabled state are managed through the Edit form or by asking Claude — not in the file.

## Key Topics

- Local vs remote task distinction on the Desktop Schedule page
- Preset frequency options: Manual, Hourly, Daily, Weekdays, Weekly
- Custom intervals via natural language in any Desktop session
- Per-task worktree isolation toggle for conflict-free runs
- Per-task permission mode with stall-on-prompt behavior
- Missed-run catch-up: one run per wake, most recent missed time only, seven-day window
- SKILL.md file at `~/.claude/scheduled-tasks/<task-name>/SKILL.md`
- Desktop notification and sidebar session on task fire
- `Keep computer awake` setting to prevent sleep-induced skips
- Comparison table: Cloud vs Desktop vs `/loop` scheduling
