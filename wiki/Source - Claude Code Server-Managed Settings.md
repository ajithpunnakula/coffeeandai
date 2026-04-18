---
title: "Source - Claude Code Server-Managed Settings"
type: source
date: 2026-04-13
source_file: "raw/configure-server-managed-settings.md"
tags: [claude-code, enterprise, configuration]
---

# Source - Claude Code Server-Managed Settings

Server-managed settings allow [[Anthropic]] Team and Enterprise administrators to centrally configure [[Claude Code]] through the Claude.ai admin console without requiring device management (MDM) infrastructure. Settings are delivered from Anthropic's servers at client startup and polled for updates hourly during active sessions. This is the recommended approach for organizations without MDM or with users on unmanaged devices; organizations with MDM can use endpoint-managed settings (macOS plist, Windows registry, or managed-settings files) for stronger OS-level enforcement. Requirements: Team or Enterprise plan, [[Claude Code]] v2.1.38+ (Teams) or v2.1.30+ (Enterprise), and network access to `api.anthropic.com`.

Configuration is defined as JSON in the admin console (**Admin Settings > Claude Code > Managed settings**) and supports all `settings.json` keys including [[Hooks]], [[Source - Claude Code Environment Variables|environment variables]], and managed-only settings like `allowManagedPermissionRulesOnly`. Server-managed settings occupy the highest tier in the settings hierarchy and cannot be overridden by any other source including command-line arguments. Within the managed tier, server-managed settings take precedence over endpoint-managed settings: if the server delivers any keys at all, endpoint-managed settings are entirely ignored. Settings do not merge between the two managed sources. Only Primary Owners and Owners can edit server-managed settings.

Security approval dialogs are shown to users on startup when settings include shell command settings, custom environment variables not on a known-safe allowlist, or hook configurations. Users must approve to proceed; rejection causes [[Claude Code]] to exit. In non-interactive (`-p`) mode, these dialogs are skipped and settings are applied silently. If the server fetch fails at startup, [[Claude Code]] by default continues without managed settings (brief unenforced window). Setting `forceRemoteSettingsRefresh: true` changes this to fail-closed: the CLI blocks until fresh settings are fetched or exits on failure. This setting self-perpetuates through local caching.

Server-managed settings are **not available** when using third-party model providers ([[Amazon Bedrock]], [[Google Vertex AI]], [[Microsoft Foundry]]) or custom API endpoints via `ANTHROPIC_BASE_URL`. Current limitations include uniform application to all users (no per-group configurations) and no support for distributing MCP server configurations through this channel. Audit log events for settings changes are available through the compliance API.

## Key Topics

- Server-managed settings vs. endpoint-managed settings (MDM): use cases and security tradeoffs
- Requirements: Team/Enterprise plan, minimum Claude Code versions, `api.anthropic.com` access
- Admin console setup: Admin Settings > Claude Code > Managed settings
- Supported configuration: all `settings.json` keys, hooks, env vars, managed-only settings
- Highest settings precedence: overrides local, project, user, and command-line args
- Server vs. endpoint priority: server wins if it delivers any keys at all (no merging)
- Settings delivery: fetched at startup, polled hourly during active sessions
- Security approval dialogs for shell commands, env vars, and hooks
- `forceRemoteSettingsRefresh: true` for fail-closed enforcement
- Self-perpetuating cached enforcement even before first successful fetch
- Limitations: no per-group configs, no MCP server distribution
- Not available on Bedrock, Vertex AI, Foundry, or custom `ANTHROPIC_BASE_URL`
- Audit logging via compliance API
