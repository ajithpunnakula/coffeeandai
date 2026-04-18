---
title: "Source - Claude Code Agent Teams"
type: source
date: 2026-04-13
source_file: "raw/orchestrate-teams-of-claude-code-sessions.md"
tags: [claude-code, automation, extensions]
---

# Source - Claude Code Agent Teams

[[Claude Code]] Agent Teams is an experimental feature that enables multi-session coordination. One session acts as the team lead, spawning and coordinating multiple teammate sessions. Unlike [[Subagents]], which run inside a single session and only report back to the main agent, teammates are fully independent [[Claude Code]] instances with their own context windows that can communicate directly with each other. Agent Teams are disabled by default and must be enabled via the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` environment variable (set to `1` in settings.json or the shell environment). The feature requires Claude Code v2.1.32 or later.

The architecture centers on three components beyond the lead session: a **shared task list** with dependency tracking and file locking to prevent race conditions, a **mailbox** for async inter-agent messaging, and the teammates themselves. Tasks move through pending, in-progress, and completed states; tasks with unresolved dependencies cannot be claimed until those dependencies complete. The lead creates tasks and either assigns them explicitly or lets teammates self-claim available work. Teammates can message each other directly (one-to-one) or broadcast to the whole team. Team and task state is stored locally at `~/.claude/teams/{team-name}/config.json` and `~/.claude/tasks/{team-name}/`.

Display modes determine how teammate sessions are presented. The default `"auto"` mode uses **in-process** display (all teammates inside the main terminal, navigated with Shift+Down) when not in tmux, or **split-pane** display (each teammate in its own pane) when inside tmux. The `tmux` mode can also use iTerm2 with the `it2` CLI. Hooks provide quality gates: `TeammateIdle` can reject idle transitions with code 2 to keep a teammate working, `TaskCreated` can block task creation, and `TaskCompleted` can block completion. Teammate permissions start from the lead's permission mode and can be changed per teammate after spawning, but not at spawn time.

[[Subagents|Subagent]] definitions can be referenced when spawning teammates, allowing reuse of defined roles (security-reviewer, test-runner, etc.) that carry their `tools` allowlist and `model` into the teammate context. Team coordination tools (`SendMessage` and task management tools) are always available to teammates regardless of `tools` restrictions. Token costs scale linearly with team size — each teammate is a separate Claude instance with its own context window — making agent teams significantly more expensive than single-session or subagent approaches. Known limitations include no session resumption with in-process teammates, no nested teams, one team per session at a time, and split-pane mode not supported in VS Code, Windows Terminal, or Ghostty.

## Key Topics

- Experimental feature requiring `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Lead session spawns independent teammate sessions, each with own context window
- Shared task list with dependency tracking and file locking
- Mailbox for async inter-agent messaging (point-to-point and broadcast)
- Display modes: in-process (any terminal) vs split-pane (tmux or iTerm2)
- Hooks: TeammateIdle, TaskCreated, TaskCompleted for quality gates
- Subagent definitions reusable as teammate roles
- Teammate permissions inherit from lead; changeable post-spawn individually
- Team state stored at `~/.claude/teams/` and `~/.claude/tasks/`
- Token cost scales linearly with team size
- Comparison with subagents: direct inter-agent communication vs report-to-lead only
- Limitations: no session resumption, no nested teams, one team per session
- Best use cases: parallel research/review, new modules, competing hypotheses debugging
