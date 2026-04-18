---
title: "Source - Claude Code Plugins Reference"
type: source
date: 2026-04-13
source_file: "raw/plugins-reference.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Plugins Reference

This is the complete technical specification for the [[Claude Code]] [[Plugins]] system. A plugin is a self-contained directory of components — [[Skills]], agents, [[Hooks]], [[MCP]] servers, and LSP servers — that extends Claude Code with custom functionality. The reference covers full component schemas, CLI commands, caching behavior, version management, and debugging tools.

The `plugin.json` manifest supports user config prompts (letting plugins request configuration values at install time), channel declarations (for MCP channel integrations), and component path overrides (so skills or agents directories can live at non-default paths). Plugin hooks are defined in `hooks/hooks.json` and support the same 26+ lifecycle events as user-defined hooks: `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, `Notification`, `SubagentStart`, `SubagentStop`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`, `SessionEnd`, and more. Hook handlers can be `command` (shell), `http` (POST request), `prompt` (single-turn LLM), or `agent` (subagent with tools). Plugin agents support `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, and `isolation` fields — but `hooks`, `mcpServers`, and `permissionMode` are not supported for security reasons.

Installed plugins are copied to a cache at `~/.claude/plugins/cache`. The `${CLAUDE_PLUGIN_DATA}` variable points to each plugin's persistent data directory, preserved across updates. This cache architecture means plugins cannot reference files outside their own directory using relative paths like `../shared-utils`; symlinks are the workaround for cross-plugin file sharing. Version management follows semantic versioning with a 7-day grace period during which old versions remain available after a new release, allowing users time to update. The `${CLAUDE_PLUGIN_ROOT}` variable resolves to the plugin's installed root directory in hook commands and MCP configurations.

Installation scopes (user, project, local, managed) determine who gets the plugin and whether it appears in version control. LSP integration through `.lsp.json` enables jump-to-definition, find-references, type-error diagnostics, and call hierarchy navigation for any language with an available language server binary. The reference includes CLI commands for debugging: listing loaded plugins, checking plugin errors via the `/plugin` Errors tab, and validating plugin structure.

## Key Topics

- Full `plugin.json` schema: user config prompts, channel declarations, component path overrides
- Plugin cache location (`~/.claude/plugins/cache`) and persistent data dir (`${CLAUDE_PLUGIN_DATA}`)
- Version management: semantic versioning, 7-day grace period for old versions
- Plugin agent frontmatter fields (and unsupported fields for security: `hooks`, `mcpServers`, `permissionMode`)
- All 26+ hook lifecycle events available to plugin hooks
- Four hook handler types: command, HTTP, prompt, agent
- `${CLAUDE_PLUGIN_ROOT}` variable for referencing plugin-relative paths
- LSP server integration via `.lsp.json`
- Installation scopes and cross-plugin file sharing via symlinks
- Debugging tools and CLI commands
