---
title: "Source - Anti-Patterns Cheatsheet"
type: source
date: 2026-04-17
source_file: "raw/anti-patterns-cheatsheet.md"
tags: [anti-patterns, certification, exam-prep, agentic-architecture, tool-design, prompt-engineering]
---

This source from Claude Certifications catalogs 18 anti-patterns commonly tested on the Claude Certified Architect Foundations exam. The cheatsheet is organized across five exam domains and rates each anti-pattern as either critical or high priority, providing both the wrong approach and the correct alternative.

In the [[Agentic Loop]] domain (D1), the document warns against parsing natural language for loop termination instead of using the structured `stop_reason` field, setting arbitrary iteration caps as the primary stopping mechanism, and relying on prompt-based enforcement for critical business rules. The correct approach for business rule enforcement is to use programmatic [[Hooks]] (PreToolUse/PostToolUse) that run as deterministic code rather than probabilistic prompt instructions. Sentiment-based escalation and self-reported confidence scores are also flagged as unreliable for production decision-making.

For Tool Design and [[MCP]] (D2), the source emphasizes returning structured errors with `isError`, `errorCategory`, `isRetryable`, and context fields rather than generic error messages. It highlights the danger of silently returning empty results for access failures, as the agent cannot distinguish between "no results found" and "could not check." The document recommends keeping 4-5 tools per agent and distributing the rest across specialized [[Subagents]], since tool selection accuracy degrades rapidly above 5 tools. Hardcoding API keys in `.mcp.json` is flagged as critical; environment variable expansion should be used instead.

The [[Claude Code]] Configuration domain (D3) covers the [[CLAUDE.md File]] hierarchy, noting that personal preferences belong in user-level config (`~/.claude/CLAUDE.md`) while team standards go in project-level config. The source distinguishes between commands (which run in current session context) and [[Skills]] (which support `context: fork` and `allowed-tools` restrictions for context isolation). Same-session self-review in CI/CD pipelines is flagged as a critical anti-pattern due to confirmation bias; separate sessions should be used for code generation and review.

In the Prompt Engineering domain (D4), vague instructions like "be thorough" are criticized for causing over-flagging and alert fatigue. The document notes that `tool_use` guarantees structure only, not semantic correctness, so extracted values must be validated with business rule checks. Generic retry messages without specific error details give the model no signal for correction.

The Context and Reliability domain (D5) warns against progressive summarization of critical customer details, recommending immutable "case facts" blocks positioned at the start of context instead. Aggregate accuracy metrics are flagged for masking per-category failures, with stratified per-document-type metrics recommended. The source also stresses the importance of provenance tracking for multi-agent data, including source, confidence level, timestamp, and agent ID.

## Key Topics
- Using `stop_reason` field instead of natural language parsing for [[Agentic Loop]] termination
- Programmatic [[Hooks]] (PreToolUse/PostToolUse) for deterministic business rule enforcement
- Structured error returns with `isError`, `errorCategory`, and `isRetryable` fields
- Keeping 4-5 tools per agent and delegating to [[Subagents]]
- [[CLAUDE.md File]] hierarchy: user-level vs project-level vs directory-level configuration
- [[Skills]] with `context: fork` for context isolation vs commands for simple tasks
- Separate sessions for code generation and review in CI/CD pipelines
- Immutable "case facts" blocks instead of progressive summarization
- Stratified per-document-type accuracy metrics
- Provenance tracking for multi-agent data resolution
- Environment variable expansion for secrets in [[MCP]] configuration
