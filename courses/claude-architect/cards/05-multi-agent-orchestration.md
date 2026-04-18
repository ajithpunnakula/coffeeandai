---
id: card_1a7d3e9f
type: page
order: 5
difficulty: 2
title: "Multi-Agent Orchestration: Hub-and-Spoke"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Subagents", "Agentic Loop"]
source: "raw/agentic-architecture-orchestration.md"
speaker_notes: "Emphasize context isolation as the key exam topic. If an answer shares full coordinator context with subagents, it is wrong. Each subagent should receive only context specific to its assigned subtask. Also highlight that multiple Task calls in a single response execute in parallel -- this is a common exam question."
content_hashes:
  "Subagents": "f6a7b8c9"
  "Agentic Loop": "d0e1f2a3"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_1a7d3e9f-jNs1rxhuVYdn9F1aDW5CNPNHWi7mDr.mp3"
---

# Multi-Agent Orchestration: Hub-and-Spoke

When a task requires multiple specialized capabilities, a single [[Agentic Loop]] is not enough. The exam tests your knowledge of **hub-and-spoke architecture**, where a central coordinator delegates work to specialized [[Subagents]].

## Hub-and-Spoke Architecture

The hub-and-spoke pattern has three components:

1. **Coordinator (hub)** -- A central agent that receives the user request, decomposes it into subtasks, delegates to subagents, and synthesizes their results.
2. **Subagents (spokes)** -- Specialized agents that each handle one subtask. Each subagent has its own focused tool set (typically 4-5 tools) and operates in isolation.
3. **Task tool** -- The mechanism for spawning subagents. The coordinator's `allowedTools` must include `"Task"` to enable subagent creation.

## Context Isolation: The Critical Rule

Each subagent gets **only the context relevant to its specific task**. This means:

- Pass a focused prompt describing exactly what the subagent should do
- Include only the data the subagent needs (e.g., "Focus: market size in USD, YoY growth, top 3 vendors")
- **Never** share the full coordinator conversation history

```python
# ANTI-PATTERN: Sharing full coordinator context
Task(
    prompt="Research market size",
    context=coordinator.full_conversation_history,  # 90% irrelevant
)

# CORRECT: Passing explicit relevant context
Task(
    prompt="Research AI infrastructure market size",
    context="Focus: market size in USD, YoY growth, top 3 vendors",
)
```

Why context isolation matters:
- **Avoids context pollution** -- irrelevant context confuses the subagent and wastes tokens
- **Improves focus** -- the subagent can devote its full context window to the actual task
- **Enables clean synthesis** -- the coordinator combines results without exploration noise

## Parallel Execution

When the coordinator issues **multiple Task calls in a single response**, those subagents execute **in parallel**. This is a key performance optimization:

```python
coordinator = Agent(
    model="claude-sonnet-4-20250514",
    tools=[Task, summarize_results, format_report]
)

# These two Task calls in a single coordinator response run in parallel
# Task 1: Market research subagent
# Task 2: Technology analysis subagent
```

## fork_session for Exploration

The `fork_session` mechanism creates a branched session for parallel exploration **without polluting the main context**. This is useful when the coordinator wants to explore multiple approaches and pick the best result without the exploration attempts cluttering the primary conversation.

## Why Hub-and-Spoke Beats Flat Architectures

| Flat (single agent) | Hub-and-Spoke |
|---|---|
| One agent tries to do everything | Coordinator delegates to specialists |
| All tools in one agent (tool confusion) | Each subagent has 4-5 focused tools |
| Context grows with every step | Each subagent starts with clean, scoped context |
| No parallelism | Multiple subagents work simultaneously |
