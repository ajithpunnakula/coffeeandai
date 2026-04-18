---
type: course
id: "course_claude_architect"
title: "Claude Certified Architect: Foundations Exam Prep"
status: published
exam_target: "claude-certified-architect-foundations"
target_audience: "Developers preparing for the Claude Certified Architect exam"
estimated_minutes: 90
pass_threshold: 0.72
difficulty_curve: gradual
domains:
  - name: "Agentic Architecture & Orchestration"
    weight: 0.25
    cards: [1, 2, 3, 4, 5, 6, 7, 8]
  - name: "Tool Design & MCP Integration"
    weight: 0.20
    cards: [9, 10, 11, 12, 13, 14]
  - name: "Claude Code Configuration & Workflows"
    weight: 0.20
    cards: [15, 16, 17, 18, 19, 20]
  - name: "Prompt Engineering & Structured Output"
    weight: 0.20
    cards: [21, 22, 23, 24, 25, 26]
  - name: "Context Management & Reliability"
    weight: 0.15
    cards: [27, 28, 29, 30, 31]
card_order:
  - cards/01-welcome.md
  - cards/02-agentic-loop.md
  - cards/03-stop-reasons.md
  - cards/04-quiz-agentic-loop.md
  - cards/05-multi-agent-orchestration.md
  - cards/06-hooks-enforcement.md
  - cards/07-quiz-multi-agent-hooks.md
  - cards/08-scenario-customer-support.md
  - cards/09-tool-design-basics.md
  - cards/10-structured-errors.md
  - cards/11-mcp-configuration.md
  - cards/12-quiz-tool-design.md
  - cards/13-scenario-developer-productivity.md
  - cards/14-reflection-tool-design.md
  - cards/15-claude-md-hierarchy.md
  - cards/16-commands-vs-skills.md
  - cards/17-plan-mode-iteration.md
  - cards/18-quiz-configuration.md
  - cards/19-scenario-code-generation.md
  - cards/20-scenario-cicd.md
  - cards/21-explicit-criteria.md
  - cards/22-few-shot-tool-use.md
  - cards/23-quiz-prompt-engineering.md
  - cards/24-validation-retry-loops.md
  - cards/25-scenario-data-extraction.md
  - cards/26-reflection-prompt-engineering.md
  - cards/27-context-optimization.md
  - cards/28-escalation-error-propagation.md
  - cards/29-quiz-context-management.md
  - cards/30-scenario-research-system.md
  - cards/31-reflection-anti-patterns.md
tags: [certification, claude-architect, exam-prep]
---

# Claude Certified Architect: Foundations Exam Prep

## Objectives
- Pass the Claude Certified Architect Foundations exam (720/1000)
- Master all 5 exam domains with weighted coverage
- Practice all 6 exam scenarios in multi-step format
- Recognize and avoid all 18 documented anti-patterns

## Exam Format
- 60 questions, 90 minutes
- Multiple choice + scenario-based
- 4 of 6 scenarios randomly selected
- Passing score: 720/1000 (72%)

## Domains
1. **Agentic Architecture & Orchestration** (25%) — Agentic loops, multi-agent orchestration, hooks, session management
2. **Tool Design & MCP Integration** (20%) — Tool descriptions, structured errors, MCP configuration, built-in tools
3. **Claude Code Configuration & Workflows** (20%) — CLAUDE.md hierarchy, commands vs skills, plan mode, CI/CD
4. **Prompt Engineering & Structured Output** (20%) — Explicit criteria, few-shot prompting, tool_use, validation-retry loops
5. **Context Management & Reliability** (15%) — Context optimization, escalation patterns, degradation mitigation, provenance
