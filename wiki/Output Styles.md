---
title: "Output Styles"
type: concept
tags: [features, configuration, claude-code]
sources: ["raw/output-styles.md", "raw/explore-the-claude-directory.md"]
---

# Output Styles

Output Styles are system prompt modifications that change [[Claude Code]]'s role, tone, and output format without altering its underlying capabilities or tool access. They are the primary mechanism for adapting Claude's communication style to different audiences — from production engineering teams to individual learners — without writing custom [[CLAUDE.md File]] instructions.

Three built-in styles ship with [[Claude Code]]. **Default** is the standard software engineering persona, focused on concise and actionable output. **Explanatory** adds "Insights" sections between task steps, narrating what Claude did and why — useful for developers who want to learn from Claude's reasoning. **Learning** is a collaborative mode that inserts `TODO(human)` markers at decision points, prompting the user to fill in parts of the solution rather than having Claude complete everything autonomously.

Custom styles are markdown files with YAML frontmatter specifying `name`, `description`, and `keep-coding-instructions` (a boolean controlling whether the standard coding system prompt is merged in or replaced entirely). They are stored in `~/.claude/output-styles/` (user-global) or `.claude/output-styles/` (project-local). [[Plugins]] can ship output styles as part of their package, extending the available styles without user configuration. The active style is saved to `.claude/settings.local.json` and takes effect at the next session start.

Output Styles occupy a different layer of the system prompt than other configuration mechanisms. [[CLAUDE.md File]] content is injected as a user message, not a system prompt modification. The `--append-system-prompt` CLI flag appends text to the existing system prompt. Output Styles, by contrast, replace or modify the base system prompt directly — giving them the highest priority for shaping Claude's persona and output conventions, at the cost of potentially conflicting with the default coding instructions if `keep-coding-instructions` is set to false.
