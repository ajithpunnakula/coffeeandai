---
title: "Source - Claude Certified Architect Foundations Exam Guide"
type: source
date: 2026-04-17
source_file: "raw/claude-certified-architect-foundations-exam-guide.md"
tags: [certification, exam-prep, anthropic]
---

This source is the official exam guide for the Claude Certified Architect -- Foundations certification, [[Anthropic]]'s first official technical certification. It provides comprehensive information about the exam format, domains, scenarios, anti-patterns, and preparation resources.

The exam is a multiple-choice, scenario-based assessment with a passing score of 720 out of 1000. It randomly selects 4 of 6 possible scenarios, targeting solution architects building production applications with Claude. The exam is currently free for the first 5,000 partner company employees and available through [[Anthropic]]'s Skilljar portal. The certification covers five weighted domains: Agentic Architecture and Orchestration (~25%), Tool Design and [[MCP]] Integration (~20%), [[Claude Code]] Configuration and Workflows (~20%), Prompt Engineering and Structured Output (~20%), and Context Management and Reliability (~15%).

The six exam scenarios test real-world architectural decisions: (1) Customer Support Resolution Agent testing [[Agent SDK]] usage, [[Hooks]], and escalation logic; (2) Code Generation with [[Claude Code]] testing [[CLAUDE.md File]] configuration, plan mode, and [[Skills]]; (3) Multi-Agent Research System testing [[Subagents]], context passing, and information provenance; (4) Developer Productivity testing built-in tool selection and [[MCP]] integration; (5) Claude Code for CI/CD testing the `-p` flag, structured output, and [[Message Batches]] API; and (6) Structured Data Extraction testing JSON schemas, tool_use, and validation-retry loops.

The guide identifies ten key anti-patterns that frequently appear as distractor answers: parsing natural language for loop termination, arbitrary iteration caps, prompt-based enforcement for critical business rules, self-reported confidence scores for escalation, sentiment-based escalation, generic error messages, silently suppressing errors, too many tools per agent (18+), same-session self-review, and aggregate-only accuracy metrics. Each anti-pattern is paired with the correct approach.

## Key Topics

- Exam format: multiple-choice, scenario-based, 720/1000 passing score
- Five weighted domains covering architecture through reliability
- Six scenarios with four randomly selected per exam
- Ten key anti-patterns as common distractor answers
- [[Agent SDK]] and [[Agentic Loop]] design patterns
- [[Hooks]] for deterministic business rule enforcement
- [[MCP]] server configuration and tool distribution
- [[Claude Code]] configuration hierarchy and CI/CD integration
- Structured output via tool_use with semantic validation
- Context management and information provenance
- Free for first 5,000 partner company employees
