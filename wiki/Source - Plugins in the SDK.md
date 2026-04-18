---
title: "Source - Plugins in the SDK"
type: source
date: 2026-04-17
source_file: "raw/plugins-in-the-sdk.md"
tags: [agent-sdk, plugins, extensibility]
---

This source explains how [[Plugins]] are loaded and used within the [[Agent SDK]] to extend [[Claude Code]] with custom functionality. Plugins are packages that can include [[Skills]], custom agents ([[Subagents]]), [[Hooks]], and [[MCP]] servers. They are loaded by providing local filesystem paths in the `plugins` option when calling `query()`.

The document specifies the plugin directory structure, which must contain a `.claude-plugin/plugin.json` manifest file. Plugins can optionally include `skills/` directories (the recommended format, replacing the legacy `commands/` directory), `agents/` directories for custom subagents, `hooks/` directories for event handlers, and `.mcp.json` files for MCP server definitions. Plugin paths can be specified as either relative (resolved from the current working directory) or absolute paths.

Skills from plugins are automatically namespaced with the plugin name to avoid conflicts. When invoked as slash commands, the format is `plugin-name:skill-name`. The SDK provides verification through the system initialization message, which lists loaded plugins and available commands. Developers can check for `system` messages with `init` subtype to confirm successful plugin loading.

The source covers practical use cases including development and testing (loading plugins without global installation), project-specific extensions (including plugins in a project repository for team consistency), and combining plugins from multiple locations. Troubleshooting guidance addresses common issues with plugin loading, skill discovery, and path resolution.

## Key Topics

- Plugins extend [[Claude Code]] with [[Skills]], [[Subagents]], [[Hooks]], and [[MCP]] servers
- Loaded via the `plugins` option with `{ type: "local", path: "..." }` syntax
- Plugin directory requires `.claude-plugin/plugin.json` manifest
- The `commands/` directory is legacy; `skills/` is the recommended format
- Plugin skills are namespaced as `plugin-name:skill-name` to prevent conflicts
- Verification through `system/init` messages listing loaded plugins and commands
- CLI-installed plugins (from `~/.claude/plugins/`) can also be used in the SDK
- Supports both Python and TypeScript SDK interfaces
