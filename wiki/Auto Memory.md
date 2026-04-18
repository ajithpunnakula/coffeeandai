---
title: "Auto Memory"
type: concept
tags: [features, claude-code]
sources: ["raw/how-claude-remembers-your-project.md", "raw/explore-the-context-window.md", "raw/explore-the-claude-directory.md"]
---

# Auto Memory

Auto Memory is [[Claude Code]]'s system for accumulating project-specific notes across sessions. As Claude works on a project, it autonomously decides what is worth saving — build commands, debugging insights, recurring patterns, quirks of the codebase — and writes these notes to `~/.claude/projects/<project>/memory/MEMORY.md`. On subsequent session starts, the first 200 lines or 25KB of this file (approximately 680 tokens) is loaded automatically into the [[Context Window]].

This distinguishes Auto Memory from [[CLAUDE.md File]]: CLAUDE.md is human-authored and intentionally curated, typically checked into version control. Auto Memory is machine-authored and accumulates organically, living outside the repo in the user's home directory. Together they provide complementary layers — human instructions for how the project should be approached, machine notes for what has been learned through actual work.

Users can inspect and manage Auto Memory with the `/memory` command, which opens the notes file for viewing and editing. Editing is encouraged — if Claude has saved something incorrect or outdated, users can fix it directly. The full file can also be deleted to reset accumulated knowledge, or memory can be disabled entirely for projects where it is not desired. Auto Memory requires [[Claude Code]] v2.1.59 or later.

Two conditions disable Auto Memory. First, [[Zero Data Retention]] organizations: storing cross-session notes requires server-side persistence, which ZDR prohibits. Second, projects where the user has explicitly opted out. In both cases, the [[Agentic Loop]] starts each session with only the [[CLAUDE.md File]] and any context the user provides manually. For teams, [[Auto-compaction]] and [[Prompt Caching]] handle within-session memory, while Auto Memory handles the cross-session layer.
