---
title: "Source - Claude Code Skills System"
type: source
date: 2026-04-13
source_file: "raw/extend-claude-with-skills.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Skills System

[[Skills]] in [[Claude Code]] are markdown files (`SKILL.md`) that extend Claude's capabilities with reusable knowledge, reference material, or invocable workflows. A skill can be invoked directly with `/skill-name` or loaded automatically by Claude when its description matches the current task. Skills follow the [[Skills|Agent Skills]] open standard (agentskills.io), with Claude Code adding extra features like invocation control, subagent execution, and dynamic context injection. Custom commands in `.claude/commands/` are merged into the skills system and work identically, though skills add more features.

Each skill is a directory containing a `SKILL.md` file as the entrypoint, optionally with supporting files (templates, examples, scripts). YAML frontmatter controls behavior: `name` becomes the slash command, `description` guides automatic invocation, `disable-model-invocation: true` hides the skill from Claude until the user invokes it manually (reducing context to zero), `allowed-tools` restricts which tools the skill can use, and `context: fork` runs the skill in an isolated subagent context. The `$ARGUMENTS` placeholder captures user-provided text after the skill name. Skills persist through context compaction, with a 5,000 token budget per skill and a 25,000 token combined budget.

Skills are discovered from four scopes in priority order: enterprise (managed settings) > personal (`~/.claude/skills/`) > project (`.claude/skills/`) > plugin (namespaced as `plugin-name:skill-name`). Claude Code also supports automatic discovery from nested `.claude/skills/` directories within a monorepo, loading package-specific skills when working in that package's directory. The `--add-dir` flag is an exception: skills from additional directories are loaded and support live change detection. Bundled skills ship with Claude Code and include `/simplify`, `/batch`, `/debug`, `/loop`, and `/claude-api`.

Two skill content types serve different purposes: reference skills (API conventions, style guides) run inline and provide knowledge Claude uses throughout the session; task skills (deploy, commit workflows) use `disable-model-invocation: true` so only the user can trigger them. Subagents preload skills specified in their `skills:` frontmatter at launch — they do not inherit skills from the parent session on demand.

## Key Topics

- `SKILL.md` file format: YAML frontmatter + markdown instructions
- Invocation control: `disable-model-invocation`, `user-invocable`, model-only vs user-only vs both
- `$ARGUMENTS` placeholder for dynamic user input
- Supporting files: templates, examples, scripts alongside `SKILL.md`
- Context cost and compaction behavior (5,000 token/skill, 25,000 combined budget)
- Scope hierarchy: enterprise > personal > project > plugin
- Monorepo nested skill discovery
- Agent Skills open standard (agentskills.io)
- Bundled skills: `/simplify`, `/batch`, `/debug`, `/loop`, `/claude-api`
- `context: fork` for subagent-isolated execution
