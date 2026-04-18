---
title: "Source - Agent Skills in the SDK"
type: source
date: 2026-04-17
source_file: "raw/agent-skills-in-the-sdk.md"
tags: [agent-sdk, skills, extensibility]
---

This source documents how [[Skills]] work within the [[Agent SDK]], covering their definition, discovery, invocation, and configuration. Skills are specialized capabilities packaged as `SKILL.md` files that [[Claude Code]] autonomously invokes when relevant to a user's request. Unlike [[Subagents]], which can be defined programmatically, Skills must exist as filesystem artifacts in `.claude/skills/` directories.

Skills are loaded from filesystem locations governed by `settingSources` (TypeScript) or `setting_sources` (Python). The SDK discovers skill metadata at startup from user-level (`~/.claude/skills/`) and project-level (`.claude/skills/`) directories, with full content loaded only when triggered. To enable Skills, developers must include `"Skill"` in the `allowedTools` configuration and ensure appropriate `settingSources` are configured. [[Plugins]] can also bundle their own Skills.

The document explains that the `allowed-tools` frontmatter field in `SKILL.md` files only applies when using [[Claude Code]] CLI directly and does not carry over to the SDK. When using the SDK, tool access must be controlled through the main `allowedTools` option in the query configuration. This is an important distinction for developers migrating from CLI-based workflows to SDK-based applications.

Each Skill is defined as a directory containing a `SKILL.md` file with YAML frontmatter and Markdown content. The `description` field is critical because it determines when Claude chooses to invoke a particular Skill. The source provides troubleshooting guidance for common issues, including Skills not being found (usually due to misconfigured `settingSources` or incorrect working directory) and Skills not being used (typically because the `"Skill"` tool is not in `allowedTools` or the description does not match user requests).

## Key Topics

- Skills are filesystem-based artifacts (`SKILL.md` files) that cannot be registered programmatically through the SDK
- Three skill locations: project (`.claude/skills/`), user (`~/.claude/skills/`), and plugin-bundled
- The `"Skill"` tool must be included in `allowedTools` for Skills to function
- `settingSources` must include `"user"` and/or `"project"` for skill discovery
- Skills are model-invoked: Claude autonomously decides when to use them based on the `description` field
- The `allowed-tools` frontmatter in `SKILL.md` only works with Claude Code CLI, not the SDK
- Skills can be tested by sending prompts that match their descriptions
- Related to [[Subagents]], [[Plugins]], and slash commands as SDK extension mechanisms
