---
title: "Source - Claude Code Output Styles"
type: source
date: 2026-04-13
source_file: "raw/output-styles.md"
tags: [claude-code, features, configuration]
---

# Source - Claude Code Output Styles

[[Claude Code]] supports output styles — system prompt modifications that adjust the role, tone, and format of responses without changing the underlying model. Three built-in styles ship with the tool: **Default** (engineering-focused, concise), **Explanatory** (adds Insights sections that elaborate on reasoning and decisions), and **Learning** (inserts `TODO(human)` markers at points requiring user attention or decision). Each style shapes how Claude structures its replies to match different workflows and user preferences.

Custom output styles can be defined as markdown files with YAML frontmatter stored in the output styles directory. This allows teams to define organization-specific communication styles — for example, a style that always produces structured tickets, or one that formats output as runbook steps. The `keep-coding-instructions` flag in a style's frontmatter controls whether the default engineering instructions are retained alongside the custom modifications.

Output styles are distinct from [[Skills]] and [[Hooks]] — they modify the system prompt rather than adding executable behavior. They compose with other configuration (CLAUDE.md project instructions, [[MCP]] tool context) rather than replacing it, allowing fine-grained tuning of response character within existing session setups.

## Key Topics

- System prompt modifications for role, tone, and format
- Three built-in styles: Default, Explanatory, Learning
- Explanatory style: adds Insights sections to responses
- Learning style: inserts `TODO(human)` markers
- Custom styles as markdown files with YAML frontmatter
- `keep-coding-instructions` flag for retaining default instructions
- Styles compose with CLAUDE.md and other config (not replacements)
- Distinct from [[Skills]] and [[Hooks]]
