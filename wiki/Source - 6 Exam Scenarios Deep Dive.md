---
title: "Source - 6 Exam Scenarios Deep Dive"
type: source
date: 2026-04-17
source_file: "raw/6-exam-scenarios-deep-dive.md"
tags: [certification, exam-prep, scenarios, architecture]
---

This source provides detailed architectural walkthroughs for all six scenarios tested on the [[Claude Certified Architect Exam]], of which four are randomly selected per exam. Each scenario includes key architectural decisions, correct approaches, common anti-patterns, tested domains, and exam strategy advice.

Scenario 1, Customer Support Resolution Agent, tests designing an AI-powered support agent using the [[Agent SDK]]. Key decisions include using stop_reason for [[Agentic Loop]] termination (not parsing natural language), enforcing business rules like refund limits via PostToolUse [[Hooks]] (not system prompt instructions), escalating based on structured criteria like policy gaps and capability limits (not sentiment or self-reported confidence), and preserving customer details using immutable "case facts" blocks (not progressive summarization).

Scenario 2, Code Generation with [[Claude Code]], tests configuration for team workflows. Team coding standards belong in project-level `.claude/CLAUDE.md` (not user-level). Plan mode is for multi-file architectural changes while direct execution suits simple fixes. Complex refactoring should use [[Skills]] with `context: fork` for isolation. The TDD iteration pattern (write failing test, implement, verify) is the preferred refinement strategy.

Scenario 3, Multi-Agent Research System, is described as the hardest scenario. It tests hub-and-spoke architecture with a coordinator delegating to specialized [[Subagents]] with isolated contexts. Only task-relevant context should be passed to subagents (not full conversation history). Conflicting data should be resolved using information provenance tracking (source, confidence, timestamp). Subagent failures require structured error propagation distinguishing access failures from empty results.

Scenario 4, Developer Productivity with Claude, focuses on tool selection. When an agent has too many tools (18+), the solution is distributing to 4-5 tools per specialized subagent. Built-in tools (Read, Write, Edit, Bash, Grep, Glob) should be used over Bash equivalents. [[MCP]] servers are configured in `.mcp.json` with `${ENV_VAR}` for secrets. Edit is preferred over Write for modifying existing files.

Scenario 5, Claude Code for CI/CD, tests pipeline integration. The `-p` flag enables non-interactive mode with `--output-format json`. Code review must use a separate session from generation to avoid confirmation bias. The [[Message Batches]] API provides 50% cost savings for non-urgent tasks like nightly audits. `--json-schema` enforces structured output for automated processing.

Scenario 6, Structured Data Extraction, tests data pipelines. tool_use with JSON schema plus tool_choice forcing guarantees structural compliance but not semantic correctness. Validation-retry loops must append specific error details (not generic messages). Enums should include an "other" category with a detail field for edge cases. Few-shot prompting with 2-4 examples covering edge cases improves consistency.

## Key Topics

- Six exam scenarios with four randomly selected per exam
- [[Hooks]]-based enforcement versus prompt-based guidance for business rules
- Hub-and-spoke multi-agent architecture with context isolation
- [[CLAUDE.md File]] hierarchy and [[Skills]] with fork context
- Built-in tool selection (Read, Write, Edit, Bash, Grep, Glob)
- [[MCP]] configuration with environment variable expansion for secrets
- [[Message Batches]] API for 50% cost savings on non-urgent tasks
- tool_use guarantees structure not semantics
- Validation-retry loops with specific error feedback
- Information provenance tracking for conflict resolution
- Session isolation for generation versus review
- Anti-patterns as common exam distractors
