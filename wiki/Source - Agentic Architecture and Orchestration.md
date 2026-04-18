---
title: "Source - Agentic Architecture and Orchestration"
type: source
date: 2026-04-17
source_file: "raw/agentic-architecture-orchestration.md"
tags: [certification, agentic-architecture, agent-sdk, orchestration, hooks]
---

This source covers Domain 1 of the Claude Certified Architect Foundations exam, worth approximately 25% of the exam. It addresses the design and implementation of agentic systems using the [[Agent SDK]], covering four sub-domains: agentic loops and core API, multi-agent orchestration, hooks and programmatic enforcement, and session management and workflows.

**Agentic Loops and Core API (d1.1)** explains the [[Agentic Loop]] as the core execution pattern for Claude-based agents. Unlike simple request-response interactions, the agentic loop enables Claude to iteratively plan, act, observe, and decide whether to continue or stop. The critical control mechanism is the `stop_reason` field in the API response: `"tool_use"` means Claude wants to call a tool and the loop should continue, while `"end_turn"` means Claude is done and the loop should exit. The [[Agent SDK]] handles this loop automatically, but understanding the mechanics is essential. Key anti-patterns include parsing natural language output to decide loop continuation, setting arbitrary iteration caps, and checking assistant text content for termination signals.

**Multi-Agent Orchestration (d1.2)** covers the hub-and-spoke architecture where a central coordinator delegates tasks to specialized [[Subagents]]. Each subagent operates in its own isolated context and returns results to the coordinator. The Task tool spawns subagents, and the coordinator's `allowedTools` must include "Task" to enable this. Multiple Task calls in a single response execute in parallel. Context isolation is heavily emphasized: each subagent should receive only the context specific to its assigned subtask, never the full coordinator conversation history. Anti-patterns include overly narrow task decomposition leading to coverage gaps, sharing full coordinator context (context pollution), and not providing explicit context when delegating.

**[[Hooks]] and Programmatic Enforcement (d1.3)** draws a critical distinction between deterministic hook-based enforcement and probabilistic prompt-based guidance. [[Hooks]] intercept tool calls before (`PreToolUse`) or after (`PostToolUse`) execution, allowing blocking, modification, or augmentation of behavior. For critical business rules like refund limits, compliance checks, and security policies, hooks guarantee enforcement where prompts cannot. Valid escalation triggers include explicit customer requests for a human, detected policy gaps, tasks exceeding agent capabilities, and business threshold violations. Invalid triggers (anti-patterns) include negative sentiment and self-reported low confidence scores.

**Session Management and Workflows (d1.4)** covers session persistence through `--resume`, session branching via `fork_session`, and named sessions via `--session-name`. Stale context is identified as a critical risk in long-running sessions, with mitigation strategies including periodic re-fetching and scratchpad files. Task decomposition is split between prompt chaining (for predictable linear tasks) and dynamic adaptive decomposition (for unpredictable tasks where intermediate results may change the approach). The source from [[Anthropic]]'s certification ecosystem emphasizes that dynamic adaptive decomposition is preferred when task complexity is unknown.

## Key Topics

- [[Agentic Loop]] lifecycle controlled by `stop_reason` values (`tool_use` vs `end_turn`)
- [[Agent SDK]] automatic loop management and its underlying mechanics
- Hub-and-spoke multi-agent orchestration with [[Subagents]]
- Context isolation as a core principle for subagent delegation
- Task tool for spawning parallel [[Subagents]]
- `PreToolUse` and `PostToolUse` [[Hooks]] for deterministic enforcement
- Programmatic enforcement vs prompt-based guidance distinction
- `fork_session` for branching sessions without context pollution
- `--resume` and named sessions for workflow continuity
- Dynamic adaptive decomposition vs prompt chaining
- Anti-patterns: parsing natural language for loop control, sharing full context, prompt-based business rules
- Exam preparation guidance for the Claude Certified Architect Foundations certification
