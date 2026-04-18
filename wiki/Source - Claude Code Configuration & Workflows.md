---
title: "Source - Claude Code Configuration & Workflows"
type: source
date: 2026-04-17
source_file: "raw/claude-code-configuration-workflows.md"
tags: [configuration, certification, exam-prep, claude-code, skills, commands, ci-cd]
---

This source from Claude Certifications covers Domain 3 of the Claude Certified Architect Foundations exam, focusing on [[Claude Code]] configuration and workflows. It accounts for approximately 20% of the exam and is organized into four sections: CLAUDE.md hierarchy, custom commands and skills, plan mode and iterative refinement, and CI/CD integration with batch processing.

The [[CLAUDE.md File]] hierarchy section explains the three configuration layers and their precedence. User-level config (`~/.claude/CLAUDE.md`) holds personal preferences not shared with the team. Project-level config (`.claude/CLAUDE.md`) contains team standards shared via git. Directory-level config (e.g., `src/api/CLAUDE.md`) applies scoped rules to that directory and below. More specific configs override more general ones. The document also covers modular configuration with `@import` syntax and the `.claude/rules/` directory for topic-specific rule files with optional path-scoped YAML frontmatter.

The custom commands and [[Skills]] section distinguishes between the two extension mechanisms. Commands (`.claude/commands/`) are simple slash commands that run in the current session context, suitable for quick one-step actions. [[Skills]] (`.claude/skills/`) are complex multi-step reusable behaviors defined with `SKILL.md` files that support `context: fork` for isolated execution, `allowed-tools` for restricting tool access, and `argument-hint` for describing expected arguments. The key anti-pattern is using commands for complex tasks that need context isolation when skills would be more appropriate.

Plan mode is covered as a strategy for complex multi-step tasks requiring architectural thinking, while direct execution is appropriate for simple, well-defined tasks. The document presents iterative refinement patterns including concrete examples, TDD iteration (write tests, implement, verify, refine), and the interview pattern ("ask me 3 questions before you start"). TDD iteration is highlighted as the preferred refinement pattern for the exam.

The CI/CD integration section covers the `-p` flag for non-interactive mode, `--output-format json` for structured output, and `--json-schema` for enforcing specific output schemas. A critical exam concept is session context isolation: the code generator session must be completely separate from the reviewer session to avoid confirmation bias. The Message Batches API offers 50% cost savings with a 24-hour processing window, using `custom_id` for tracking individual requests.

## Key Topics
- [[CLAUDE.md File]] three-layer hierarchy: user, project, directory with override precedence
- Modular configuration with `@import` and `.claude/rules/` directory
- [[Skills]] with `context: fork`, `allowed-tools`, and `argument-hint` frontmatter
- Commands vs skills: context isolation as the deciding factor
- Plan mode for complex tasks vs direct execution for simple tasks
- TDD iteration as the preferred iterative refinement pattern
- `-p` flag for non-interactive [[Claude Code]] in CI/CD pipelines
- `--output-format json` and `--json-schema` for structured CI/CD output
- Session context isolation to prevent confirmation bias in code review
- Message Batches API with 50% cost savings and `custom_id` tracking
