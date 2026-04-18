---
title: "Anti-Patterns Cheatsheet"
source: "https://claudecertifications.com/claude-certified-architect/anti-patterns"
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

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)Anti-Patterns Cheatsheet

# Anti-Patterns Cheatsheet

The most common wrong answers and distractors on the Claude Certified Architect exam. Learn to spot them instantly and eliminate 2-3 options before even reading the correct answer.

10 critical7 high priority18 total patterns

## Jump to Domain

[D1Agentic Architecture](#domain-1)[D2Tool Design & MCP](#domain-2)[D3Claude Code Config](#domain-3)[D4Prompt Engineering](#domain-4)[D5Context & Reliability](#domain-5)

## D1Agentic Architecture5 patterns

### Parsing natural language for loop termination

Critical

Text content is for the user, not control flow. The model may phrase completion differently each time.

#### Check stop\_reason field (tool\_use vs end\_turn)

stop\_reason is a structured, deterministic field that reliably signals whether the agent needs to continue.

### Arbitrary iteration caps as primary stopping mechanism

Critical

May cut off the agent mid-task or allow it to loop pointlessly. Does not reflect task completion.

#### Let the agentic loop terminate naturally via stop\_reason

The model decides when it is done based on task state, not an arbitrary number.

### Prompt-based enforcement for critical business rules

Critical

Prompts are probabilistic. The model CAN and WILL sometimes ignore critical instructions.

#### Use programmatic hooks (PreToolUse/PostToolUse) for deterministic enforcement

Hooks run as code, not suggestions. They provide 100% reliable enforcement.

### Sentiment-based escalation to human agents

High

An angry customer with a simple request does NOT need a human. Sentiment does not equal task complexity.

#### Escalate based on policy gaps, capability limits, explicit requests, or business thresholds

Objective criteria prevent unnecessary escalations while catching genuine edge cases.

### Self-reported confidence scores for decision-making

High

Model confidence scores are not well-calibrated and cannot be relied upon for production decisions.

#### Use structured criteria and programmatic checks for escalation decisions

Programmatic checks based on observable facts are reliable and auditable.

## D2Tool Design & MCP4 patterns

### Generic error messages ('Operation failed')

Critical

The agent cannot decide whether to retry, try an alternative, or escalate without details.

#### Return structured errors: isError, errorCategory, isRetryable, and context

Structured errors give the agent enough information to make intelligent recovery decisions.

### Silently returning empty results for access failures

Critical

The agent thinks 'no results found' when the real problem is 'could not even check.' This leads to catastrophic misunderstandings.

#### Distinguish access failures (isError: true) from genuinely empty results (isError: false, results: [])

The agent knows whether data is missing because it was not found vs. because the search failed.

### Giving one agent 18+ tools

High

Tool selection accuracy degrades rapidly above 5 tools. Similar tools create ambiguity.

#### Keep 4-5 tools per agent. Distribute the rest across specialized subagents.

Focused agents with fewer tools make better selections and produce higher quality results.

### Hardcoding API keys in .mcp.json configuration

Critical

Configuration files are committed to git. Hardcoded secrets get leaked.

#### Use ${ENV\_VAR} environment variable expansion in MCP config

Secrets stay in the environment, not in version-controlled files.

## D3Claude Code Config3 patterns

### Putting personal preferences in project-level CLAUDE.md

Medium

Personal preferences (editor settings, themes) should not be imposed on the whole team.

#### Use ~/.claude/CLAUDE.md for personal prefs, .claude/CLAUDE.md for team standards

Each configuration layer has a specific purpose and audience.

### Using commands for complex tasks that need context isolation

High

Commands run in the current session context, polluting it with exploration noise.

#### Use skills with context: fork and allowed-tools restrictions

Forked context keeps exploration separate. Tool restrictions prevent accidental side effects.

### Same-session self-review in CI/CD pipelines

Critical

The reviewer retains the generator's reasoning context, creating confirmation bias.

#### Use separate sessions for code generation and code review

A fresh session reviews the code objectively with no preconceptions.

## D4Prompt Engineering3 patterns

### Vague instructions like 'be thorough' or 'find all issues'

Critical

Leads to over-flagging, false positives, and alert fatigue. Developers stop trusting the tool.

#### Provide explicit, measurable criteria: 'flag functions exceeding 50 lines'

Specific criteria produce consistent, actionable results that build trust.

### Assuming tool\_use guarantees semantic correctness

High

tool\_use guarantees STRUCTURE only. Values inside the JSON may still be wrong.

#### Validate extracted values after tool\_use with business rule checks

Schema compliance + semantic validation together ensure both correct format AND correct content.

### Generic retry messages: 'There were errors, please try again'

High

Without specific error details, the model has no signal for what to fix.

#### Append specific error details: which field, what was wrong, expected vs actual

Specific feedback gives the model a clear correction target.

## D5Context & Reliability3 patterns

### Progressive summarization of critical customer details

Critical

Each round of summarization loses specifics: names, IDs, amounts, dates.

#### Use immutable 'case facts' blocks positioned at the start of context

Case facts are never summarized and sit in a high-recall position (beginning of context).

### Aggregate accuracy metrics only (e.g., '95% overall')

Critical

Aggregate metrics mask per-category failures. Invoices at 70% while receipts at 99% still averages 95%.

#### Track accuracy per document type (stratified metrics)

Per-type tracking reveals hidden failures that aggregate metrics conceal.

### No provenance tracking for multi-agent data

High

When subagents provide conflicting data, there is no way to determine which source to trust.

#### Track source, confidence level, timestamp, and agent ID for all data

Provenance metadata enables informed conflict resolution and audit trails.

## Quick Reference Summary

10

Critical Patterns

Most likely to appear on exam

7

High Priority

Frequently seen as distractors

18

Total Patterns

Across all 5 domains

Memorizing these anti-patterns lets you instantly eliminate 2-3 wrong answers on most exam questions.

## Test Your Anti-Pattern Knowledge

See if you can spot the anti-patterns in our practice questions.

[Practice Questions](/claude-certified-architect/practice-questions)[Study Domain Guides](/claude-certified-architect/domains)

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
