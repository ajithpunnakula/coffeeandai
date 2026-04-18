---
title: "Source - Claude Code Plugin Marketplace Creation"
type: source
date: 2026-04-13
source_file: "raw/create-and-distribute-a-plugin-marketplace.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Plugin Marketplace Creation

A [[Plugins]] marketplace in [[Claude Code]] is a catalog (defined in `marketplace.json`) that enables centralized discovery, version tracking, and automatic updates for plugin distribution. Marketplaces can be hosted on GitHub, GitLab, other git hosts, self-hosted servers, or as direct URLs to `marketplace.json` files. The guide covers creating the catalog, hosting options, and the full schema for marketplace and plugin entries.

The `marketplace.json` file lives at `.claude-plugin/marketplace.json` in the repository root. Required fields are `name` (kebab-case, public-facing identifier users see when installing, e.g., `acme-tools`), `owner` (name and optional email), and `plugins` (array of plugin entries). Optional metadata includes `description`, `version`, and `pluginRoot` (a base directory prepended to relative plugin source paths, allowing shorthand like `"source": "formatter"` instead of `"source": "./plugins/formatter"`). Each plugin entry needs at minimum `name` and `source`.

Plugin source types support four formats: relative paths (`./plugins/formatter`), GitHub repos (`{"source": "github", "repo": "owner/repo"}`), git URLs (any HTTP/SSH git URL), and HTTP URLs (direct link to a `marketplace.json`). URL-based marketplaces have limitations with relative plugin paths. Several marketplace names are reserved for Anthropic's official use and cannot be used by third parties: `claude-plugins-official`, `claude-code-marketplace`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `knowledge-work-plugins`, `life-sciences`, and names that impersonate official marketplaces.

Enterprises can use managed marketplace restrictions to control which marketplaces users are allowed to add, distributing vetted plugins through organization-controlled sources. Teams can configure `extraKnownMarketplaces` in `.claude/settings.json` so that when team members trust the project folder, Claude Code prompts them to install the team marketplace and its plugins. When a plugin is installed from a marketplace, Claude Code copies the plugin directory to a cache — which means plugins cannot reference files outside their own directory, and symlinks are needed for shared resources.

## Key Topics

- `marketplace.json` schema: `name`, `owner`, `plugins`, optional `metadata.pluginRoot`
- Four plugin source types: relative path, GitHub repo (`owner/repo`), git URL, HTTP URL
- Reserved marketplace names (cannot be used by third parties)
- Hosting via GitHub, GitLab, self-hosted git, or direct URL
- `extraKnownMarketplaces` for team-level auto-install configuration
- Managed marketplace restrictions for enterprise control
- Plugin caching and the constraint against cross-plugin relative paths
- Walkthrough: local marketplace with a `/quality-review` skill
- `/plugin marketplace add`, `update`, `remove`, `list` commands
