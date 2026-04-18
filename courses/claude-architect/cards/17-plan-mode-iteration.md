---
id: card_72a1e8f6
type: page
order: 17
difficulty: 2
title: "Plan Mode and Iterative Refinement"
domain: "Claude Code Configuration & Workflows"
wiki_refs: ["Claude Code", "Skills"]
source: "raw/claude-code-configuration-workflows.md"
content_hashes:
  "Claude Code": "7ebc57e4"
  "Skills": "e9bbf81e"
speaker_notes: |
  Explain plan mode as the right tool for complex, multi-file changes where you need to see the full picture before writing code. Contrast it with direct execution for simple tasks. Then introduce the TDD iteration pattern as the most effective way to work with Claude Code on implementation: write a failing test first, implement the code, run the tests, and iterate. This gives Claude concrete, verifiable goals instead of vague instructions. Highlight both anti-patterns: using plan mode for trivial fixes, and giving vague instructions like make it better.
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_72a1e8f6-yAL59aRWuPJ1DC5OywvcCwDpN0HfAE.mp3"
---

# Plan Mode and Iterative Refinement

Knowing when to plan and when to execute directly is a key skill for working effectively with Claude Code. The wrong mode for the task wastes time; the right mode produces better results faster.

## Plan Mode: Think Before You Build

Plan mode asks Claude to **outline its approach before writing any code**. This is invaluable for:

- Multi-file architectural changes with interconnected dependencies
- Refactoring that touches shared interfaces or data models
- Tasks where the implementation order matters (e.g., database migration before API changes)
- Situations where you want to review the approach before committing to it

In plan mode, Claude analyzes the codebase, identifies affected files, and proposes a step-by-step plan. You can review, adjust, and approve before any code is written.

## Direct Execution: Just Do It

For simple, well-defined tasks, plan mode adds unnecessary overhead:

- Single-file bug fixes with clear reproduction steps
- Adding a new test for existing behavior
- Updating a configuration value
- Renaming a variable or function

## The TDD Iteration Pattern

The most effective workflow for implementation with Claude Code follows a **test-driven development** cycle:

1. **Write a failing test** -- Define the expected behavior concretely
2. **Implement** -- Let Claude write the code to pass the test
3. **Run tests** -- Verify the implementation meets the specification
4. **Refine** -- If tests fail, Claude has concrete error messages to work from
5. **Repeat** -- Move to the next behavior

This pattern works because it gives Claude **measurable, verifiable goals**. Instead of vague instructions, each cycle has a clear success criterion: the test passes.

## Anti-Patterns to Avoid

### Plan mode for trivial tasks
Using plan mode for a one-line bug fix wastes time generating an architectural overview for something that needs no architecture. Match the tool to the task complexity.

### Vague instructions without criteria
Asking Claude to "make it better" or "clean this up" provides no measurable target. Claude cannot verify its own success without criteria. Instead, specify what "better" means: "reduce function length to under 20 lines," "add error handling for null inputs," or "extract the validation logic into a separate function."

### Implementing everything then testing last
Writing all the code before running any tests means bugs compound. Each subsequent change may build on a flawed foundation. TDD catches issues at each step, keeping the codebase correct incrementally.

**Exam tip:** Multi-file architectural changes call for plan mode. Single-file fixes call for direct execution. TDD gives Claude the concrete feedback loop it needs for reliable implementation.
