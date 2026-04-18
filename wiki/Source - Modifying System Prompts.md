---
title: "Source - Modifying System Prompts"
type: source
date: 2026-04-17
source_file: "raw/modifying-system-prompts.md"
tags: [agent-sdk, system-prompts, configuration, claude-md]
---

This source describes four methods for customizing Claude's behavior through system prompts in the [[Agent SDK]]: [[CLAUDE.md File]] files, output styles, `systemPrompt` with append, and fully custom system prompts.

By default, the [[Agent SDK]] uses a minimal system prompt containing only essential tool instructions. The full [[Claude Code]] system prompt (which includes tool usage instructions, code style guidelines, response tone settings, security instructions, and environment context) must be explicitly requested via `systemPrompt: { type: "preset", preset: "claude_code" }`.

**Method 1: [[CLAUDE.md File]] files** provide persistent, project-specific context. They are discovered at the project level (`CLAUDE.md` or `.claude/CLAUDE.md`), user level (`~/.claude/CLAUDE.md`), and load when the corresponding `settingSources` is enabled. They are version-controlled, team-shared, and automatic -- no code changes needed. However, they are not loaded if `settingSources: []` is passed.

**Method 2: Output styles** are saved markdown configurations stored at `~/.claude/output-styles` (user-level) or `.claude/output-styles` (project-level). They persist across sessions and can create specialized assistants like code reviewers or data scientists. They load when `settingSources` includes the relevant source.

**Method 3: `systemPrompt` with append** uses the `claude_code` preset as a base and adds custom instructions via the `append` property. This preserves all built-in functionality while adding domain-specific knowledge. The `excludeDynamicSections` flag (available from v0.2.98+ TypeScript, v0.1.58+ Python) moves per-session context (working directory, git status, platform info) into the first user message, enabling [[Prompt Caching]] across sessions and machines.

**Method 4: Custom system prompts** replace the default entirely with a custom string, giving complete control but losing built-in tools, safety instructions, and environment context unless manually included.

The document includes a comparison table showing that CLAUDE.md and output styles preserve default tools and safety, while custom prompts require manual inclusion. CLAUDE.md is the only approach that provides automatic environment context and team-shared version control.

## Key Topics

- Four methods for system prompt customization in the [[Agent SDK]]
- [[CLAUDE.md File]] as persistent project instructions
- Output styles as reusable saved configurations
- `systemPrompt` preset with `append` for incremental customization
- `excludeDynamicSections` for cross-session [[Prompt Caching]]
- Custom system prompts for complete control
- `settingSources` controlling which filesystem settings load
- Default minimal system prompt vs. full [[Claude Code]] preset
- Trade-offs between persistence, reusability, and customization level
- Version control integration for team-shared instructions
