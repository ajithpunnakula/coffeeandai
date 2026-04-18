---
title: "6 Exam Scenarios — Deep Dive"
source: "https://claudecertifications.com/claude-certified-architect/scenarios"
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

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)Scenario Walkthroughs

# 6 Exam Scenarios — Deep Dive

The exam randomly selects 4 of these 6 scenarios. Each walkthrough covers the key architectural decisions, correct approaches, common anti-patterns, and which domains are tested.

4 of 6 appear on your exam~20 min read

## Jump to Scenario

[1Customer Support Resolution Agent](#scenario-1)[2Code Generation with Claude Code](#scenario-2)[3Multi-Agent Research System](#scenario-3)[4Developer Productivity with Claude](#scenario-4)[5Claude Code for CI/CD](#scenario-5)[6Structured Data Extraction](#scenario-6)

Scenario 1

## Customer Support Resolution Agent

Design an AI-powered customer support agent that handles inquiries, resolves issues, and escalates complex cases. Tests Agent SDK usage, MCP tools, and escalation logic.

Agent SDK implementationEscalation pattern designHook-based compliance enforcementStructured error handling

### Key Architectural Decisions

How should the agentic loop terminate?

Correct

Check stop\_reason: continue on 'tool\_use', exit on 'end\_turn'

Anti-Pattern

Parsing assistant text for 'done' or 'complete' keywords

How to enforce a $500 refund limit?

Correct

PostToolUse hook that programmatically blocks refund tool calls above $500 and escalates

Anti-Pattern

Adding 'never process refunds above $500' to the system prompt

When should the agent escalate to a human?

Correct

Escalate on: explicit customer request, policy gaps, capability limits, business thresholds

Anti-Pattern

Escalating based on negative sentiment or self-reported low confidence

How to preserve customer details in long conversations?

Correct

Immutable 'case facts' block at the start of context with name, account ID, order, amounts

Anti-Pattern

Progressive summarization that silently loses critical specifics over multiple rounds

### Domains Tested

D1: Agentic loop control via stop\_reason

D1: Hooks for deterministic business rule enforcement

D2: Structured error responses from tool failures

D5: Case facts blocks for context preservation

Exam Strategy

This scenario tests the intersection of agentic architecture and reliability. Focus on hook-based enforcement (not prompts) and case facts (not summarization). Every escalation question will try to trick you with sentiment-based triggers.

Scenario 2

## Code Generation with Claude Code

Configure Claude Code for a development team workflow. Tests CLAUDE.md configuration, plan mode, slash commands, and iterative refinement strategies.

CLAUDE.md hierarchy setupPlan mode vs direct executionCustom slash commands and skillsTDD iteration pattern

### Key Architectural Decisions

Where should team coding standards go?

Correct

.claude/CLAUDE.md (project-level, version-controlled, shared with team)

Anti-Pattern

~/.claude/CLAUDE.md (user-level, personal only) or inline code comments

When to use plan mode vs direct execution?

Correct

Plan mode for multi-file architectural changes; direct execution for simple, well-defined fixes

Anti-Pattern

Always using plan mode (wasteful for simple tasks) or never using it (risky for complex changes)

How to handle complex refactoring that needs isolation?

Correct

Use a skill with context: fork and allowed-tools restrictions

Anti-Pattern

Using a simple command that runs in the main session context, polluting it with exploration noise

Best iterative refinement strategy?

Correct

TDD iteration: write failing test, implement, verify, refine while keeping tests green

Anti-Pattern

Vague instructions like 'make it better' without concrete verification criteria

### Domains Tested

D3: CLAUDE.md hierarchy (user vs project vs directory)

D3: Commands vs skills (isolation and tool restriction)

D3: Plan mode for complex tasks

D4: Explicit criteria and TDD iteration for refinement

Exam Strategy

This scenario is purely about Claude Code configuration. Know the three configuration layers, when to use commands vs skills, and the TDD iteration pattern. The exam loves to test whether you put personal prefs in project config.

Scenario 3

## Multi-Agent Research System

Build a coordinator-subagent system for parallel research tasks. Tests multi-agent orchestration, context passing, error propagation, and result synthesis.

Hub-and-spoke architectureContext isolation and passingError propagation patternsInformation provenance and synthesis

### Key Architectural Decisions

What architecture for parallel research tasks?

Correct

Hub-and-spoke: coordinator delegates to specialized subagents with isolated contexts

Anti-Pattern

Flat architecture where all agents share a global state or full conversation history

How to pass context from coordinator to subagents?

Correct

Pass ONLY the context relevant to each subagent's specific task

Anti-Pattern

Sharing the full coordinator conversation history with every subagent

How to handle conflicting data from different subagents?

Correct

Track information provenance (source, confidence, timestamp) and resolve based on reliability

Anti-Pattern

Arbitrarily choosing one result or averaging conflicting values without provenance

How to handle subagent failures?

Correct

Structured error propagation: report what was attempted, error type, distinguish access failure from empty result

Anti-Pattern

Silently returning empty results for failed lookups or generic 'operation failed' errors

### Domains Tested

D1: Hub-and-spoke multi-agent orchestration

D1: Context isolation for subagents

D5: Information provenance tracking

D5: Error propagation and access failure vs empty result

Exam Strategy

This is the hardest scenario. It tests multi-agent patterns deeply. The key traps are: sharing full context with subagents (always wrong), silently dropping subagent failures (always wrong), and ignoring provenance when resolving conflicts.

Scenario 4

## Developer Productivity with Claude

Build developer tools using the Claude Agent SDK with built-in tools and MCP servers. Tests tool selection, codebase exploration, and code generation workflows.

Built-in tool selection (Read, Write, Bash, Grep, Glob)MCP server integrationCodebase exploration strategiesTool distribution across agents

### Key Architectural Decisions

Agent has 18 tools and selects the wrong one. What to do?

Correct

Reduce to 4-5 tools per agent, distribute the rest across specialized subagents

Anti-Pattern

Making tool descriptions longer, fine-tuning the model, or switching to a larger model

Which built-in tool for reading a config file?

Correct

Read tool (purpose-built for file reading)

Anti-Pattern

Bash('cat config.json') — never use Bash when a dedicated tool exists

How to configure project-level MCP servers?

Correct

.mcp.json with ${ENV\_VAR} for secrets, version-controlled for the team

Anti-Pattern

~/.claude.json (personal only) or hardcoding API keys in config files

Write vs Edit for modifying an existing file?

Correct

Edit for targeted changes to existing files (preserves unchanged content)

Anti-Pattern

Write replaces the ENTIRE file — using it on existing files loses content you did not include

### Domains Tested

D2: Tool distribution (4-5 per agent optimal)

D2: Built-in tool selection (Read/Write/Edit/Bash/Grep/Glob)

D2: MCP server configuration and secrets management

D2: Tool description best practices

Exam Strategy

This scenario is tool-focused. Memorize the 6 built-in tools and when to use each. The '18 tools' question is almost guaranteed — always distribute across subagents. Never use Bash when a built-in tool exists.

Scenario 5

## Claude Code for CI/CD

Integrate Claude Code into continuous integration and delivery pipelines. Tests -p flag usage, structured output, batch API, and multi-pass code review.

-p flag for non-interactive modeStructured output with --output-format jsonBatch API with Message BatchesSession isolation for generator vs reviewer

### Key Architectural Decisions

How to run Claude Code in a CI pipeline?

Correct

Use -p flag for non-interactive mode with --output-format json for structured results

Anti-Pattern

Running in interactive mode or piping commands via stdin

How to review code that Claude generated?

Correct

Use a SEPARATE session for review (fresh context, no confirmation bias)

Anti-Pattern

Same-session self-review where the reviewer retains the generator's reasoning

Nightly code audit: synchronous or batch?

Correct

Message Batches API for non-urgent tasks (50% cost savings, processes within 24h)

Anti-Pattern

Synchronous requests for non-urgent tasks (2x the cost with no benefit)

How to enforce structured output from review?

Correct

--json-schema flag to enforce specific output shape for automated processing

Anti-Pattern

Parsing unstructured text output from the review with regex

### Domains Tested

D3: -p flag and --output-format json for CI/CD

D3: Session isolation (generator vs reviewer)

D3: Batch API for non-urgent processing (50% savings)

D4: Structured output via schemas

Exam Strategy

Three facts to memorize: (1) -p for non-interactive, (2) NEVER self-review in the same session, (3) Batch API for non-urgent = 50% savings. These three cover most questions in this scenario.

Scenario 6

## Structured Data Extraction

Build a structured data extraction pipeline from unstructured documents. Tests JSON schemas, tool\_use, validation-retry loops, and few-shot prompting.

JSON schema design for tool\_useValidation-retry loop implementationFew-shot prompting for format consistencyField-level confidence and human review

### Key Architectural Decisions

How to guarantee structured JSON output from extraction?

Correct

tool\_use with JSON schema + tool\_choice forcing a specific tool

Anti-Pattern

Prompting 'output as JSON' (not guaranteed) or post-processing with regex (fragile)

Does tool\_use guarantee correctness?

Correct

No — tool\_use guarantees STRUCTURE only. Validate SEMANTICS separately with business rules.

Anti-Pattern

Assuming tool\_use output is always correct because it matched the schema

What to do when extraction validation fails?

Correct

Append SPECIFIC error details (which field, what's wrong) and retry

Anti-Pattern

Generic retry: 'there were errors, try again' (no signal for what to fix)

How to handle ambiguous document types?

Correct

Include 'other' enum value + document\_type\_detail field for edge cases; use 2-4 few-shot examples covering edge cases

Anti-Pattern

Rigid enum without 'other' category (forces misclassification of unexpected types)

### Domains Tested

D4: tool\_use for structured output (structure vs semantics)

D4: Validation-retry loops with specific error feedback

D4: Few-shot prompting (2-4 examples, edge case coverage)

D5: Per-document-type accuracy tracking (stratified metrics)

Exam Strategy

The critical concept here is that tool\_use guarantees structure, NOT semantics. Every question about extraction reliability will test this. Also know that validation retries need SPECIFIC errors, not generic messages.

## Ready to Test Your Knowledge?

Practice with scenario-based questions that mirror the real exam format.

[Practice Questions](/claude-certified-architect/practice-questions)[Review Anti-Patterns](/claude-certified-architect/anti-patterns)

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
