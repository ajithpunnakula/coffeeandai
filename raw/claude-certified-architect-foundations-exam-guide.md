---
title: "Claude Certified Architect – Foundations Exam Guide"
source: "https://claudecertifications.com/claude-certified-architect/exam-guide"
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

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)Exam Guide

# Claude Certified Architect – Foundations Exam Guide

Everything you need to know about Anthropic's first official technical certification. Exam format, domains, scenarios, and how to prepare.

5 domains · 6 scenarios · 10 anti-patterns~15 min read

## Exam Overview

Certification Name

Claude Certified Architect – Foundations

Issued By

Anthropic

Exam Format

Multiple choice, scenario-based

Passing Score

720 / 1000

Scenarios

4 of 6 scenarios randomly selected

Target Audience

Solution architects building production applications with Claude

Cost

Free for first 5,000 partner company employees

Availability

Available now for Anthropic partners

Register for the Exam

Request access through Anthropic's official Skilljar portal. Currently available for partner company employees.

[Go to Registration Portal](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)

## 5 Exam Domains

The exam covers five domains. Each domain has a specific weight indicating how many questions relate to that topic. Understanding all five domains is essential for passing.

[### Domain 1: Agentic Architecture & Orchestration

~25%

Design and implement agentic systems using Claude's Agent SDK. Covers agentic loops, multi-agent orchestration, hooks, workflows, session management, and task decomposition patterns for production-grade AI applications.](/claude-certified-architect/domains/agentic-architecture)[### Domain 2: Tool Design & MCP Integration

~20%

Design effective tools and integrate with Model Context Protocol (MCP) servers. Covers tool description best practices, structured error responses, tool distribution, MCP configuration, and Claude's built-in tools.](/claude-certified-architect/domains/tool-design-mcp)[### Domain 3: Claude Code Configuration & Workflows

~20%

Configure Claude Code for development workflows. Covers CLAUDE.md hierarchy, custom commands and skills, plan mode, iterative refinement, CI/CD integration, and batch processing.](/claude-certified-architect/domains/claude-code-config)[### Domain 4: Prompt Engineering & Structured Output

~20%

Master prompt engineering techniques for production systems. Covers explicit criteria, few-shot prompting, tool\_use for structured output, JSON schema design, validation-retry loops, and multi-pass review strategies.](/claude-certified-architect/domains/prompt-engineering)[### Domain 5: Context Management & Reliability

~15%

Manage context effectively in production systems. Covers progressive summarization risks, context positioning, escalation patterns, error propagation, context degradation, human review, and information provenance.](/claude-certified-architect/domains/context-management)

## 6 Exam Scenarios

The exam presents you with 4 of 6 possible scenarios, randomly selected. Each scenario places you in a real-world context where you must make architectural decisions for production Claude applications.

1

### Customer Support Resolution Agent

Design an AI-powered customer support agent that handles inquiries, resolves issues, and escalates complex cases. Tests Agent SDK usage, MCP tools, and escalation logic.

Key Skills Tested

Agent SDK implementationEscalation pattern designHook-based compliance enforcementStructured error handling

2

### Code Generation with Claude Code

Configure Claude Code for a development team workflow. Tests CLAUDE.md configuration, plan mode, slash commands, and iterative refinement strategies.

Key Skills Tested

CLAUDE.md hierarchy setupPlan mode vs direct executionCustom slash commands and skillsTDD iteration pattern

3

### Multi-Agent Research System

Build a coordinator-subagent system for parallel research tasks. Tests multi-agent orchestration, context passing, error propagation, and result synthesis.

Key Skills Tested

Hub-and-spoke architectureContext isolation and passingError propagation patternsInformation provenance and synthesis

4

### Developer Productivity with Claude

Build developer tools using the Claude Agent SDK with built-in tools and MCP servers. Tests tool selection, codebase exploration, and code generation workflows.

Key Skills Tested

Built-in tool selection (Read, Write, Bash, Grep, Glob)MCP server integrationCodebase exploration strategiesTool distribution across agents

5

### Claude Code for CI/CD

Integrate Claude Code into continuous integration and delivery pipelines. Tests -p flag usage, structured output, batch API, and multi-pass code review.

Key Skills Tested

-p flag for non-interactive modeStructured output with --output-format jsonBatch API with Message BatchesSession isolation for generator vs reviewer

6

### Structured Data Extraction

Build a structured data extraction pipeline from unstructured documents. Tests JSON schemas, tool\_use, validation-retry loops, and few-shot prompting.

Key Skills Tested

JSON schema design for tool\_useValidation-retry loop implementationFew-shot prompting for format consistencyField-level confidence and human review

## Key Anti-Patterns (Common Wrong Answers)

These anti-patterns frequently appear as distractor answers on the exam. Recognizing them is critical for choosing the correct answer.

✗

Parsing natural language for loop termination

✓ Instead: Check stop\_reason ('tool\_use' vs 'end\_turn')

✗

Arbitrary iteration caps as primary stopping

✓ Instead: Let the agentic loop terminate naturally via stop\_reason

✗

Prompt-based enforcement for critical business rules

✓ Instead: Use programmatic hooks for deterministic enforcement

✗

Self-reported confidence scores for escalation

✓ Instead: Use structured criteria and programmatic checks

✗

Sentiment-based escalation

✓ Instead: Escalate based on task complexity, policy gaps, not sentiment

✗

Generic error messages ('Operation failed')

✓ Instead: Include isError, errorCategory, isRetryable, and context

✗

Silently suppressing errors (empty results as success)

✓ Instead: Distinguish access failures from genuinely empty results

✗

Too many tools per agent (18+)

✓ Instead: Keep to 4-5 tools per agent for optimal selection

✗

Same-session self-review

✓ Instead: Use separate sessions to avoid reasoning context bias

✗

Aggregate accuracy metrics only

✓ Instead: Track accuracy per document type to catch masked failures

## Official Resources

[### Register for the Exam

Request access through the Anthropic Skilljar portal](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)[### 12-Week Study Plan

Structured week-by-week preparation covering all 5 domains](/claude-certified-architect/study-guide)[### Anti-Patterns Cheatsheet

18 common wrong answers with severity ratings and do/don't comparisons](/claude-certified-architect/anti-patterns)[### Scenario Walkthroughs

Deep dive into all 6 architectural scenarios tested on the exam](/claude-certified-architect/scenarios)

## Ready to Start Studying?

Follow our structured 12-week plan or dive into individual domains.

[Start 12-Week Study Plan](/claude-certified-architect/study-guide)[Explore Exam Domains](/claude-certified-architect/domains)

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
