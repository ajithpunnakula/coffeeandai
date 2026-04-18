---
title: "Extended Thinking"
type: concept
tags: [features, claude-code]
sources: ["raw/common-workflows.md", "raw/model-configuration.md", "raw/manage-costs-effectively.md", "raw/building-with-extended-thinking.md"]
---

# Extended Thinking

Extended Thinking is Claude's internal reasoning process that occurs before generating a response. In [[Claude Code]], it is enabled by default and visible in verbose mode (toggled with Ctrl+O) as gray italic text distinct from the main response. Rather than a fixed token budget, Opus 4.6 and Sonnet 4.6 use adaptive reasoning that dynamically allocates thinking tokens based on a configurable effort level.

Four effort levels are supported: `low`, `medium`, `high`, and `max` (the last is Opus 4.6 only). Effort can be set multiple ways: the `/effort` slash command, the `--effort` CLI flag at session start, the `CLAUDE_CODE_EFFORT_LEVEL` environment variable, or a settings file entry. The `ultrathink` keyword, when included in a prompt, sets effort to `high` for that single turn only — a quick escalation for particularly complex requests without changing the session-level default.

Default thinking budgets can reach tens of thousands of tokens per request, making Extended Thinking the dominant cost driver for complex multi-step tasks. Lowering effort with `/effort low` or capping with `MAX_THINKING_TOKENS` is recommended for simpler tasks like single-file edits, grep-and-replace work, or documentation updates. The budget is applied per [[Agentic Loop]] iteration, so long multi-step tasks multiply the cost across many turns.

Extended Thinking works together with other features: [[Fast Mode]] speeds delivery of both thinking and response tokens; [[Prompt Caching]] cannot cache the thinking tokens themselves but can cache the system prompt and static context that precedes them; and [[Auto-compaction]] summarizes thinking output along with the rest of the context when the [[Context Window]] nears its limit.
