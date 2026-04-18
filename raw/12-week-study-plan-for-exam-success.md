---
title: "12-Week Study Plan for Exam Success"
source: "https://claudecertifications.com/claude-certified-architect/study-guide"
author: ""
published: 
created: 2026-04-17
description: ""

tags:
  - "clippings"
---

[Skip to content](#main-content)

[Claude Certifications](/)

[Certified Architect](/claude-certified-architect)[Claude 101](/courses/claude-101)[Claude Code](/courses/claude-code-in-action)[AI Fluency](/courses/ai-fluency-foundations)[Videos](/videos)[Practice](/claude-certified-architect/practice-questions)[Exam Guide](/claude-certified-architect/exam-guide)[Register for Exam](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)Study Guide

# 12-Week Study Plan for Exam Success

A structured, week-by-week preparation plan designed to take you from fundamentals to exam-ready in 12 weeks, spending roughly 1 hour per day.

3 phases · 12 weeks · 84 hours total~10 min read

12 Weeks

Duration

~1 Hour

Daily Time

All 5

Domains Covered

13 Tests

Practice Tests

Phase 1 · Weeks 1–4

### Foundations

Agentic architecture, multi-agent systems, hooks, tool design & MCP integration

Phase 2 · Weeks 5–8

### Applied Knowledge

Claude Code config, CI/CD integration, prompt engineering, validation & multi-pass review

Phase 3 · Weeks 9–12

### Exam Prep

Context management, provenance, hands-on exercises, full practice exams

## Week-by-Week Breakdown

W1

### Agentic Loops & Core API

Foundations · Domain 1.1

Day 1

Read exam guide domains 1-5 and understand the 6 scenarios

Day 2

Study agentic loop lifecycle: stop\_reason ('tool\_use' vs 'end\_turn')

Day 3

Build a minimal agentic loop with the Agent SDK

Day 4

Study anti-patterns: parsing NL for loop termination, arbitrary iteration caps

Day 5

Practice Test 1 (Agentic Loops — 10 questions)

Day 6

Review wrong answers and re-read task statement 1.1

Day 7

Rest / light review

W2

### Multi-Agent Orchestration

Foundations · Domain 1.2–1.3

Day 1

Study hub-and-spoke architecture, coordinator role, subagent context isolation

Day 2

Study Task tool for subagent spawning, allowedTools must include 'Task'

Day 3

Build a coordinator + 2 subagents with explicit context passing

Day 4

Study parallel subagent execution, fork\_session for branched exploration

Day 5

Study task decomposition pitfalls (overly narrow = coverage gaps)

Day 6

Practice Test 2 (Multi-Agent Systems — 10 questions)

Day 7

Rest / review

W3

### Hooks, Workflows & Sessions

Foundations · Domain 1.4–1.7

Day 1

Study PostToolUse hooks for data normalization and tool call interception

Day 2

Study programmatic enforcement vs prompt-based guidance (deterministic vs probabilistic)

Day 3

Build a hook that blocks refunds above $500 and redirects to escalation

Day 4

Study session management: --resume, fork\_session, named sessions, stale context

Day 5

Study task decomposition: prompt chaining vs dynamic adaptive decomposition

Day 6

Practice Test 3 (Hooks, Workflows & Sessions — 10 questions)

Day 7

Rest / review

W4

### Tool Design & MCP

Foundations · Domain 2.1–2.5

Day 1

Study tool description best practices: input formats, examples, edge cases

Day 2

Study structured error responses: isError, errorCategory, isRetryable

Day 3

Study tool distribution: 4-5 tools per agent max, scoped tool access

Day 4

Study MCP server config: .mcp.json (project) vs ~/.claude.json (user)

Day 5

Study built-in tools: Read, Write, Edit, Bash, Grep, Glob — when to use each

Day 6

Practice Test 4 (Tool Design & MCP — 10 questions)

Day 7

Rest / review

W5

### Claude Code Configuration

Applied Knowledge · Domain 3.1–3.3

Day 1

Study CLAUDE.md hierarchy: user, project, directory levels

Day 2

Study @import syntax, .claude/rules/ directory for topic-specific rules

Day 3

Study custom slash commands (.claude/commands/) vs skills (.claude/skills/)

Day 4

Study SKILL.md frontmatter: context: fork, allowed-tools, argument-hint

Day 5

Study path-specific rules: YAML frontmatter with paths glob patterns

Day 6

Practice Test 5 (Claude Code Config — 10 questions)

Day 7

Rest / review

W6

### Plan Mode, Iteration & CI/CD

Applied Knowledge · Domain 3.4–3.6

Day 1

Study plan mode vs direct execution decision criteria

Day 2

Study iterative refinement: concrete examples, TDD iteration, interview pattern

Day 3

Study CI/CD: -p flag, --output-format json, --json-schema

Day 4

Study session context isolation in CI (generator vs reviewer)

Day 5

Study batch processing: Message Batches API, 50% savings, 24h window

Day 6

Practice Test 6 (Plan Mode & CI/CD — 10 questions)

Day 7

Rest / review

W7

### Prompt Engineering & Structured Output

Applied Knowledge · Domain 4.1–4.3

Day 1

Study explicit criteria over vague instructions, false positive impact

Day 2

Study few-shot prompting: 2-4 examples for ambiguous cases

Day 3

Study tool\_use with JSON schemas: guaranteed schema compliance vs semantic errors

Day 4

Study tool\_choice: 'auto' vs 'any' vs forced specific tool

Day 5

Study schema design: required vs optional, enums with 'other' + detail

Day 6

Practice Test 7 (Prompt Engineering — 10 questions)

Day 7

Rest / review

W8

### Validation, Batch & Multi-Pass

Applied Knowledge · Domain 4.4–4.6

Day 1

Study validation-retry loops: append specific errors to prompt

Day 2

Study detected\_pattern fields for tracking dismissal patterns

Day 3

Study batch processing strategy: synchronous for blocking, batch for latency-tolerant

Day 4

Study self-review limitations: same session retains reasoning context

Day 5

Study multi-pass review: per-file local analysis + cross-file integration pass

Day 6

Practice Test 8 (Validation & Multi-Pass — 10 questions)

Day 7

Rest / review

W9

### Context Management

Exam Prep · Domain 5.1–5.3

Day 1

Study progressive summarization risks, 'lost in the middle' effect

Day 2

Study 'case facts' blocks, trimming verbose tool outputs, position-aware ordering

Day 3

Study escalation patterns: customer demands, policy gaps, sentiment ≠ complexity

Day 4

Study error propagation: structured context vs generic errors

Day 5

Study local recovery before coordinator escalation, partial results reporting

Day 6

Practice Test 9 (Context & Reliability — 10 questions)

Day 7

Rest / review

W10

### Advanced Context & Provenance

Exam Prep · Domain 5.4–5.6

Day 1

Study context degradation in extended sessions, scratchpad files

Day 2

Study /compact, subagent delegation, crash recovery manifests

Day 3

Study human review: stratified sampling, field-level confidence

Day 4

Study information provenance: claim-source mappings, temporal data

Day 5

Study synthesis output: well-established vs contested, source characterizations

Day 6

Practice Test 10 (Advanced Context — 10 questions)

Day 7

Rest / review

W11

### Integration & Hands-On Exercises

Exam Prep · All Domains

Day 1

Complete Exercise 1: Multi-Tool Agent with Escalation Logic

Day 2

Complete Exercise 2: Claude Code Team Workflow Configuration

Day 3

Complete Exercise 3: Structured Data Extraction Pipeline

Day 4

Complete Exercise 4: Multi-Agent Research Pipeline

Day 5

Full Practice Exam 1 (50 questions, all 6 scenarios)

Day 6

Review all wrong answers, identify weak domains

Day 7

Rest / review weak areas

W12

### Final Exam Prep

Exam Prep · Review & Practice

Day 1

Targeted review of weakest domain

Day 2

Targeted review of second weakest domain

Day 3

Full Practice Exam 2 (50 questions, all 6 scenarios)

Day 4

Review wrong answers, fill gaps

Day 5

Full Practice Exam 3 (50 questions, timed)

Day 6

Light review of key concepts, anti-patterns, and gotchas

Day 7

Exam day!

## Study Tips for Success

### Read the Official Exam Guide First

Download Anthropic's exam guide PDF. It contains domain breakdowns and sample questions that closely mirror the actual exam.

### Focus on Anti-Patterns

Exam distractors are often anti-patterns. If you can spot what's wrong, you can eliminate 2-3 options immediately.

### Build Real Projects

Hands-on experience with the Agent SDK, MCP servers, and Claude Code solidifies conceptual understanding.

### Review Wrong Answers Deeply

After each practice test, spend more time reviewing wrong answers than taking the test itself. Understand WHY each answer is wrong.

### Use the Anthropic Academy

Anthropic's courses on Skilljar and GitHub cover foundational topics directly tested on the exam.

### Understand the 'Why' Not Just the 'What'

The exam tests architectural reasoning. Know why hub-and-spoke beats flat multi-agent, why hooks beat prompts for enforcement, etc.

## Recommended Resources

[### Exam Guide & Format

Exam structure, scoring, domains, and how to prepare](/claude-certified-architect/exam-guide)[### All 5 Domain Deep Dives

Key concepts, anti-patterns, and exam tips per domain](/claude-certified-architect/domains)[### Anti-Patterns Cheatsheet

18 common wrong answers with do/don't comparisons](/claude-certified-architect/anti-patterns)[### Scenario Walkthroughs

Architectural deep dives for all 6 exam scenarios](/claude-certified-architect/scenarios)[### Practice Questions

25 exam-style questions with detailed explanations](/claude-certified-architect/practice-questions)

## Ready to Dive Into the Domains?

Explore each exam domain in detail with key concepts, anti-patterns, and exam tips.

[Explore Exam Domains](/claude-certified-architect/domains)[Try Practice Questions](/claude-certified-architect/practice-questions)

[Claude Certifications](/)

Free courses, study guides, and certification prep for Claude and agentic AI development. Learn at your own pace with hands-on lessons and practice quizzes.

### Courses

* [All Courses](/courses)
* [Claude 101](/courses/claude-101)
* [What Is Claude?](/courses/claude-101/what-is-claude)
* [Claude Projects](/courses/claude-101/introduction-to-projects)
* [Claude Code in Action](/courses/claude-code-in-action)
* [MCP Servers Guide](/courses/claude-code-in-action/mcp-servers)
* [Video Tutorials](/videos)

### Architect Certification

* [12-Week Study Plan](/claude-certified-architect/study-guide)
* [Exam Domains](/claude-certified-architect/domains)
* [Practice Questions](/claude-certified-architect/practice-questions)
* [Exam Guide](/claude-certified-architect/exam-guide)
* [Anti-Patterns](/claude-certified-architect/anti-patterns)
* [FAQ](/claude-certified-architect/faq)

### Quick Links

* [Browse All Courses](/courses)
* [Architect Cert Overview](/claude-certified-architect)
* [Disclaimer & Sources](/disclaimer)

© 2026 claudecertifications.com. All trademarks belong to their respective owners.

Built for the Claude architect community
