---
title: "Skills"
type: concept
tags: [extensions, claude-code]
sources: ["raw/extend-claude-with-skills.md", "raw/extend-claude-code.md", "raw/explore-the-claude-directory.md", "raw/agent-skills-in-the-sdk.md"]
---

# Skills

Skills are markdown-based `SKILL.md` files stored in `.claude/skills/` that extend [[Claude Code]] with reusable knowledge, workflows, and slash commands. They implement the open Agent Skills standard (agentskills.io) and are the preferred successor to the legacy `.claude/commands/` directory. Skills bridge the gap between static [[CLAUDE.md File]] instructions and dynamic tool-using [[Subagents]]: they encode structured procedures that Claude can follow without requiring a separate context window.

Two types exist. **Reference skills** are always-available knowledge bases — they load automatically and contribute to Claude's background understanding of a project (e.g., coding conventions, API documentation). **Task skills** are user-triggered workflows invoked via `/skill-name` slash commands. Frontmatter controls invocation: `disable-model-invocation: true` restricts a skill to user-only invocation; `user-invocable: false` makes it Claude-only (triggered internally, not from the command palette). Skills support a `$ARGUMENTS` placeholder so a single skill file can be parameterized at call time.

Skills persist through context compaction, which is their key advantage over instructions placed in conversation history. Each skill occupies up to 5,000 tokens in the [[Context Window]], with a combined budget of 25,000 tokens across all installed skills. Accompanying resource files (scripts, templates, data files) can live alongside the SKILL.md and are accessible to Claude during execution. Built-in bundled skills include `/batch` (parallel task execution), `/simplify` (code review and cleanup), `/loop` (repeated execution), and `/debug` (structured debugging workflows).

Skills compose naturally with [[Plugins]]: a plugin manifest can bundle skills alongside [[Hooks]], [[Subagents]], and [[MCP]] servers, and skill names are namespaced as `/plugin-name:skill-name` to avoid collisions. Skills can also reference [[CLAUDE.md File]] content and invoke [[Subagents]] for tasks requiring isolated context. Together, skills, hooks, and subagents form the three pillars of [[Claude Code]]'s extension layer.

## See also

- [[Plugins]]
- [[Hooks]]
- [[Subagents]]
- [[CLAUDE.md File]]
- [[Context Window]]
- [[.claude Directory]]
