---
title: "Claude Certified Architect Exam"
type: entity
tags: [certification, anthropic]
sources: ["raw/claude-certified-architect-foundations-exam-guide.md", "raw/5-exam-domains-you-must-master.md", "raw/6-exam-scenarios-deep-dive.md", "raw/12-week-study-plan-for-exam-success.md", "raw/practice-questions-for-exam-prep.md", "raw/anti-patterns-cheatsheet.md", "raw/agentic-architecture-orchestration.md", "raw/claude-code-configuration-workflows.md", "raw/prompt-engineering-structured-output.md", "raw/context-management-reliability.md", "raw/tool-design-mcp-integration.md"]
---

# Claude Certified Architect Exam

The Claude Certified Architect — Foundations is [[Anthropic]]'s professional certification for validating expertise in designing and deploying [[Claude Code]]-based solutions. The exam tests architectural decision-making across five weighted domains and six hands-on scenarios.

## Exam format

- 60 questions, 90-minute time limit
- Mix of multiple-choice and scenario-based questions
- Passing score: 70%
- Proctored online via Anthropic's certification platform

## Five domains

| Domain | Weight | Focus |
|---|---|---|
| 1. Agentic Architecture & Orchestration | 25% | [[Agentic Loop]], multi-agent patterns, [[Subagents]], hub-and-spoke, session management |
| 2. Tool Design & [[MCP]] Integration | 20% | Tool descriptions, structured errors, [[MCP]] config, built-in tools, distribution |
| 3. Configuration & Workflows | 20% | [[CLAUDE.md File]] hierarchy, [[Skills]] vs commands, plan mode, CI/CD with [[Agent SDK]] |
| 4. Prompt Engineering & [[Structured Output]] | 20% | Explicit criteria, few-shot, `tool_use` for output, validation-retry loops |
| 5. Context Management & Reliability | 15% | [[Context Window]] optimization, escalation, degradation mitigation, provenance |

## Six scenarios

The exam presents six architectural scenarios requiring candidates to select the correct approach: multi-agent code review pipeline, customer support escalation, data pipeline with error recovery, documentation generation across repos, security audit with compliance reporting, and CI/CD integration with progressive rollout. Each scenario tests cross-domain reasoning and has specific anti-patterns to avoid.

## Anti-patterns

The exam heavily tests recognition of 18 documented anti-patterns, including: using `--system-prompt` instead of `--append-system-prompt` (which loses built-in safety instructions), hardcoding tool lists instead of using [[Tool Search]], using `bypassPermissions` in production, ignoring session state in multi-turn workflows, and over-relying on a single agent instead of orchestrating [[Subagents]].

## Study resources

A structured 12-week study plan covers all five domains across three phases: foundations (weeks 1-4), applied skills (weeks 5-8), and exam readiness (weeks 9-12), with 13 practice tests and 25 published practice questions.

## See also

- [[Anthropic]], [[Claude Code]], [[Agent SDK]]
- [[Source - Claude Certified Architect Foundations Exam Guide]]
