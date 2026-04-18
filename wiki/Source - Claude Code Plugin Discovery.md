---
title: "Source - Claude Code Plugin Discovery"
type: source
date: 2026-04-13
source_file: "raw/discover-and-install-prebuilt-plugins-through-marketplaces.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Plugin Discovery

[[Claude Code]] includes a built-in [[Plugins]] manager accessible via `/plugin`, with four tabs: Discover (browse available plugins from all added marketplaces), Installed (view and manage installed plugins), Marketplaces (add/remove/update marketplace sources), and Errors (view plugin loading errors). The official Anthropic marketplace (`claude-plugins-official`) is pre-configured and available at launch without any setup — it can be browsed at claude.com/plugins.

The official marketplace organizes plugins into three categories. Code intelligence plugins use the Language Server Protocol to give Claude jump-to-definition, find-references, type-error diagnostics after every edit, and call hierarchy navigation. LSP plugins are available for 11 languages: C/C++ (`clangd-lsp`), C# (`csharp-lsp`), Go (`gopls-lsp`), Java (`jdtls-lsp`), Kotlin (`kotlin-lsp`), Lua (`lua-lsp`), PHP (`php-lsp`), Python (`pyright-lsp`), Rust (`rust-analyzer-lsp`), Swift (`swift-lsp`), and TypeScript (`typescript-lsp`). Each requires the corresponding language server binary to be installed. External integration plugins bundle pre-configured [[MCP]] servers for GitHub, GitLab, Atlassian (Jira/Confluence), Asana, Linear, Notion, Figma, Vercel, Firebase, Supabase, Slack, and Sentry. Development workflow plugins add [[Skills]] and agents for common tasks: `commit-commands`, `pr-review-toolkit`, `agent-sdk-dev`, and `plugin-dev`.

Marketplaces can be added from GitHub (`owner/repo` format), git URLs (GitLab, Bitbucket, self-hosted), local paths, or remote URLs. Installation scopes are user (all projects), project (shared via `.claude/settings.json` in the repo), and local (personal, not shared). Managed scope is set by administrators and cannot be modified. The `/reload-plugins` command activates changes mid-session without restarting. Teams configure `extraKnownMarketplaces` in `.claude/settings.json` so Claude Code prompts team members to install the team marketplace when they trust the project folder. Auto-updates can be configured per marketplace, with official Anthropic marketplaces having auto-update enabled by default.

The Anthropic demo marketplace (`claude-code-plugins` at `anthropics/claude-code`) is a separately-added example repository showing what the plugin system can do. Output style plugins (`explanatory-output-style`, `learning-output-style`) customize how Claude presents responses, demonstrating that plugins can affect behavior beyond adding tools.

## Key Topics

- `/plugin` manager UI: Discover, Installed, Marketplaces, Errors tabs
- Official marketplace (`claude-plugins-official`): pre-configured, no setup needed
- LSP plugins for 11 languages (C/C++, C#, Go, Java, Kotlin, Lua, PHP, Python, Rust, Swift, TypeScript)
- What LSP gives Claude: automatic diagnostics after edits, code navigation
- External integration plugins: GitHub, GitLab, Jira, Figma, Vercel, Supabase, Sentry, Linear, Slack, Notion, Firebase
- Development workflow plugins: `commit-commands`, `pr-review-toolkit`, `agent-sdk-dev`, `plugin-dev`
- Adding marketplaces from GitHub, git URLs, local paths, remote URLs
- Installation scopes: user, project, local, managed
- `extraKnownMarketplaces` for team configuration
- Auto-update configuration per marketplace
