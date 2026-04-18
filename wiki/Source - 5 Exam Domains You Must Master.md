---
title: "Source - 5 Exam Domains You Must Master"
type: source
date: 2026-04-17
source_file: "raw/5-exam-domains-you-must-master.md"
tags: [certification, exam-prep, domains]
---

This source provides an overview of the five core domains tested on the [[Claude Certified Architect Exam]]. Each domain carries a specific weight indicating the proportion of questions dedicated to that topic, and the source links to detailed deep-dive pages for each domain.

Domain 1, Agentic Architecture and Orchestration, accounts for approximately 25% of the exam and is the most heavily weighted. It covers designing and implementing agentic systems using the [[Agent SDK]], including [[Agentic Loop]] control, multi-agent orchestration with [[Subagents]], [[Hooks]] and programmatic enforcement, session management, and task decomposition patterns for production-grade AI applications.

Domain 2, Tool Design and [[MCP]] Integration, accounts for approximately 20% of the exam. It covers designing effective tools with proper descriptions, structured error responses using fields like isError, errorCategory, and isRetryable, tool distribution strategies (4-5 tools per agent optimal), MCP server configuration via `.mcp.json` and `~/.claude.json`, and [[Claude Code]]'s built-in tools (Read, Write, Edit, Bash, Grep, Glob).

Domain 3, [[Claude Code]] Configuration and Workflows, also accounts for approximately 20%. It covers the [[CLAUDE.md File]] hierarchy (user, project, directory levels), custom commands and [[Skills]], plan mode versus direct execution, iterative refinement including TDD patterns, CI/CD integration with the `-p` flag, and batch processing with the [[Message Batches]] API.

Domain 4, Prompt Engineering and Structured Output, accounts for approximately 20%. It covers explicit criteria and instruction design, few-shot prompting (2-4 examples optimal), tool_use for guaranteed JSON schema compliance, validation-retry loops with specific error feedback, and multi-pass review strategies using separate sessions.

Domain 5, Context Management and Reliability, accounts for approximately 15% and is the lightest domain. It covers progressive summarization risks, context positioning and the "lost in the middle" effect, escalation patterns, error propagation, context degradation in extended sessions, human review with stratified sampling, and information provenance tracking.

## Key Topics

- Five exam domains with weighted distribution (25/20/20/20/15)
- [[Agentic Loop]] design and multi-agent orchestration (Domain 1)
- Tool design best practices and [[MCP]] integration (Domain 2)
- [[Claude Code]] configuration, [[Skills]], and CI/CD workflows (Domain 3)
- Prompt engineering and structured output via tool_use (Domain 4)
- [[Context Window]] management and reliability patterns (Domain 5)
- Links to detailed domain-specific study material
- 12-week study plan as recommended preparation path
