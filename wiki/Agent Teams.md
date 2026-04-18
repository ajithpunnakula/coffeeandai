---
title: "Agent Teams"
type: concept
tags: [extensions, automation, claude-code]
sources: ["raw/orchestrate-teams-of-claude-code-sessions.md", "raw/extend-claude-code.md"]
---

# Agent Teams

Agent Teams is an experimental multi-session coordination feature for [[Claude Code]] where a lead session spawns and manages teammate instances, each operating in its own [[Context Window]]. Unlike [[Subagents]] — which only report results back to the parent — agent teams support direct inter-agent messaging, enabling more complex collaborative workflows.

The lead session coordinates work through two shared mechanisms: a **task list** with dependency tracking and file locking (preventing race conditions when multiple agents write concurrently), and an **async mailbox** for passing messages between agents. Each teammate is a full [[Claude Code]] session with its own context and tool access. Display modes offer flexibility: teammates can run in-process (output interleaved in the lead's terminal) or in split-pane view via tmux or iTerm2 for visual separation. The lead can inspect each teammate's progress and send new instructions via the mailbox.

Quality gates integrate with [[Hooks]] via events like **TeammateIdle** (fires when a teammate has no pending work), **TaskCreated**, and **TaskCompleted**. This allows automated validation workflows — for example, running tests after a teammate completes a feature implementation before marking the task done. The cost profile is significant: agent teams consume approximately 7x more tokens than a standard single-session workflow, since each teammate runs its own full context and turn cycle.

Agent teams are gated behind the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` environment variable, signaling their early-preview status. Best practice is to use [[Claude Code]]'s Sonnet model for teammates (rather than Opus) to manage costs, reserving more capable models for the lead orchestrator when precision matters most. For simpler parallelism — delegating a focused subtask — [[Subagents]] are preferred; agent teams shine for long-horizon collaborative tasks where teammates need to communicate and coordinate independently.

## See also

- [[Subagents]]
- [[Hooks]]
- [[Context Window]]
- [[Claude Code]]
