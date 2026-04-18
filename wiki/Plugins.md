---
title: "Plugins"
type: concept
tags: [extensions, claude-code]
sources: ["raw/create-plugins.md", "raw/plugins-reference.md", "raw/discover-and-install-prebuilt-plugins-through-marketplaces.md", "raw/plugins-in-the-sdk.md", "raw/constrain-plugin-dependency-versions.md"]
---

# Plugins

Plugins are self-contained installable bundles that package [[Skills]], [[Hooks]], [[Subagents]], [[MCP]] servers, and LSP servers together into a single distributable unit. They are the highest-level extension primitive in [[Claude Code]]'s extension layer, designed for sharing reusable capability sets across teams and the broader community.

A plugin is defined by a `plugin.json` manifest inside a `.claude-plugin/` directory. The manifest declares all bundled components, their configuration, and metadata. Skills contributed by a plugin are namespaced as `/plugin-name:skill-name` to prevent collision with other plugins or user-defined skills. Plugins can include persistent data storage via the `${CLAUDE_PLUGIN_DATA}` path, and a local cache at `~/.claude/plugins/cache` with a 7-day version grace period ensures offline use after installation. Installation scopes mirror the rest of [[Claude Code]]'s configuration hierarchy: user, project, local, and managed.

Distribution happens through **marketplaces** — `marketplace.json` catalog files that can be hosted on GitHub, GitLab, or any URL. The official marketplace (`claude-plugins-official`) includes LSP plugins for 11 programming languages and integration plugins for GitHub, Jira, Figma, Vercel, Supabase, Sentry, Linear, Slack, Notion, and Firebase. Third-party marketplaces can be registered with [[Claude Code]] to extend the discovery surface. Plugins are managed via the `/plugin` slash command (install, uninstall, update, list).

Enterprise administrators control plugin availability through managed settings: `pluginsEnabled` and `allowedPluginSources` restrict which marketplaces and plugin identifiers are permitted in a deployment. This makes plugins suitable for both individual developers assembling a personal toolkit and organizations standardizing tooling across engineering teams. The [[Channels]] system is itself distributed as a plugin, as are many [[MCP]] server integrations.

## See also

- [[Skills]]
- [[Hooks]]
- [[Subagents]]
- [[MCP]]
- [[Channels]]
- [[Claude Code]]
