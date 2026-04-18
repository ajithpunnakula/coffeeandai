---
title: "Claude Desktop App"
type: entity
tags: [tool]
sources: ["raw/use-claude-code-desktop.md", "raw/get-started-with-the-desktop-app.md", "raw/schedule-recurring-tasks-in-claude-code-desktop.md"]
---

# Claude Desktop App

The Claude Desktop App is a native macOS and Windows application that bundles [[Claude Code]] into a standalone GUI. It provides three primary tabs: Chat (conversational Claude), Cowork (autonomous background tasks running in a cloud-hosted VM), and Code (interactive coding sessions with local file access). The app is the primary surface for users who prefer not to manage a terminal and for workflows that span mobile, desktop, and CI environments.

Notable capabilities include computer use (Claude can control the desktop GUI), parallel sessions with automatic [[Git Worktrees]] isolation (each background task gets its own branch), a live app preview pane with an embedded browser for real-time UI iteration, and GitHub PR monitoring with auto-fix suggestions. Dispatch allows delegating tasks from a mobile device to a running desktop session. SSH session support enables Claude to operate on remote machines. Scheduled tasks can be configured to run Claude Code sessions on a cron-like schedule, suitable for nightly maintenance, report generation, or automated code review. See [[Source - Claude Code Desktop Scheduled Tasks]] for scheduling details.

The desktop app shares all configuration with the CLI: [[CLAUDE.md File]] project memory, [[MCP]] (MCP) server registrations, [[Hooks]], [[Skills]], and `settings.json` are all read from the same locations. This means a project set up for CLI use works identically in the desktop app, and vice versa. [[Anthropic]] hosts the cloud VM infrastructure used by Cowork sessions; local Code sessions run on the user's own machine.
