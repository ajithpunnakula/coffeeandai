---
title: "Source - Use Claude Code Features in the SDK"
type: source
date: 2026-04-17
source_file: "raw/use-claude-code-features-in-the-sdk.md"
tags: [agent-sdk, claude-code, settings, skills, hooks]
---

This source documents how to load [[Claude Code]] filesystem-based features into [[Agent SDK]] agents, including project instructions ([[CLAUDE.md File]] and rules), [[Skills]], [[Hooks]], and permission configurations.

The `settingSources` option (TypeScript) / `setting_sources` (Python) controls which filesystem settings the SDK loads. Three sources are available: `"project"` (loads from `<cwd>/.claude/` and parent directories), `"user"` (loads from `~/.claude/`), and `"local"` (loads `CLAUDE.local.md` and `.claude/settings.local.json`). Omitting the option is equivalent to `["user", "project", "local"]`, matching [[Claude Code]] CLI behavior. Passing an empty array `[]` limits the agent to programmatic configuration only.

Some inputs are read regardless of `settingSources`: managed policy settings, `~/.claude.json` global config, and auto memory at `~/.claude/projects/<project>/memory/`. For multi-tenant isolation, each tenant should run in its own filesystem with `settingSources: []` plus `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.

[[CLAUDE.md File]] files load from multiple locations: project root (`CLAUDE.md` or `.claude/CLAUDE.md`), project rules (`.claude/rules/*.md`), parent directories, child directories (on demand when files in that subtree are accessed), local gitignored (`CLAUDE.local.md`), user level (`~/.claude/CLAUDE.md`), and user rules (`~/.claude/rules/*.md`). All levels are additive with no hard precedence -- conflicting instructions depend on Claude's interpretation.

[[Skills]] are markdown files in `.claude/skills/<name>/SKILL.md` that provide on-demand specialized knowledge. Unlike CLAUDE.md (loaded every session), skills load only when relevant. The `Skill` tool must be included in `allowedTools` if using an allowlist. Skills must be filesystem artifacts; there is no programmatic API for registering them.

[[Hooks]] work in two ways: filesystem hooks (shell commands in `settings.json`, loaded via `settingSources`) and programmatic hooks (callback functions passed to `query()`). Both types execute during the same lifecycle. Hook callbacks receive tool input and return a decision dict -- empty `{}` allows the tool, while `{"decision": "block", "reason": "..."}` prevents execution. The TypeScript SDK supports additional hook events beyond Python, including `SessionStart`, `SessionEnd`, `TeammateIdle`, and `TaskCompleted`.

## Key Topics

- `settingSources` / `setting_sources` controlling filesystem feature loading
- Three setting sources: project, user, local
- [[CLAUDE.md File]] load locations and additive behavior
- [[Skills]] as on-demand markdown-based capabilities
- Filesystem vs. programmatic [[Hooks]] running side by side
- Multi-tenant isolation with `settingSources: []`
- Auto memory and managed policy settings loading regardless of settingSources
- [[Subagents]] vs. agent teams comparison
- Hook callback signatures and decision return types
- `.claude/rules/*.md` for additional project rules
- Feature comparison table (CLAUDE.md, Skills, Subagents, Hooks, MCP)
