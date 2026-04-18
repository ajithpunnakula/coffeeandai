---
title: "Source - Claude Code Plugin Creation"
type: source
date: 2026-04-13
source_file: "raw/create-plugins.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Plugin Creation

[[Plugins]] in [[Claude Code]] are self-contained directories that bundle [[Skills]], agents, [[Hooks]], [[MCP]] servers, and LSP servers into a single installable unit. The key distinguishing feature is namespacing: plugin skills use the format `/plugin-name:skill-name` (e.g., `/my-plugin:hello`) to prevent conflicts when multiple plugins are installed. This differs from standalone `.claude/` configuration which uses short names like `/deploy`. Plugins are designed for sharing across repositories and distributing via marketplaces; standalone configuration is better for project-specific or personal quick-iteration use.

A plugin requires a `.claude-plugin/plugin.json` manifest at minimum — only `plugin.json` lives inside `.claude-plugin/`, while all other directories (`skills/`, `agents/`, `hooks/`, `.mcp.json`, `.lsp.json`, `bin/`, `settings.json`) sit at the plugin root level. The manifest defines `name` (used as the namespace prefix), `description`, `version`, and optionally `author`, `homepage`, `repository`, and `license`. Skills are added as directories under `skills/<name>/SKILL.md`. A plugin-level `settings.json` can activate one of the plugin's custom agents as the main thread, changing Claude Code's default behavior when the plugin is enabled.

Testing uses the `--plugin-dir ./my-plugin` flag, which loads the plugin without installation. Multiple plugins can be loaded simultaneously with repeated flags. The `/reload-plugins` command picks up changes mid-session without restarting. When a `--plugin-dir` plugin has the same name as an installed marketplace plugin, the local copy takes precedence (except for force-enabled managed plugins). Existing `.claude/` configurations can be migrated to plugins: copy `commands/` and `agents/` directories to the plugin root, and move hooks from `settings.json` to `hooks/hooks.json`. After migration, uninstall the originals to avoid duplicates.

LSP server support can be added via `.lsp.json` for languages not covered by the official marketplace plugins (C/C++, C#, Go, Java, Kotlin, Lua, PHP, Python, Rust, Swift, TypeScript are already available). Submitting to the official Anthropic marketplace is done via claude.ai/settings/plugins/submit or platform.claude.com/plugins/submit.

## Key Topics

- Plugin vs standalone configuration trade-offs
- Plugin directory structure: `.claude-plugin/plugin.json` + root-level component dirs
- `plugin.json` manifest schema: name, description, version, author
- Skill namespacing: `/plugin-name:skill-name`
- `$ARGUMENTS` placeholder in plugin skills
- Local testing with `--plugin-dir` flag and `/reload-plugins`
- `settings.json` for activating a default agent
- LSP server integration via `.lsp.json`
- Migrating from standalone `.claude/` configuration to plugins
- Submitting to the official Anthropic marketplace
