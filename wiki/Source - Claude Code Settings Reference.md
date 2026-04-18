---
title: "Source - Claude Code Settings Reference"
type: source
date: 2026-04-13
source_file: "raw/claude-code-settings.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Settings Reference

[[Claude Code]] uses a hierarchical scope system to manage configuration. Four scopes are evaluated in order of precedence: **Managed** (highest, cannot be overridden) > **Local** (`.claude/settings.local.json`) > **Project** (`.claude/settings.json`) > **User** (`~/.claude/settings.json`). Command-line arguments slot in between Managed and Local. This structure lets individuals have personal preferences while organizations can enforce non-negotiable policies.

The primary configuration file is `settings.json`, which supports a comprehensive schema for [[Source - Claude Code Permission Configuration|Permissions]], [[Hooks]], [[MCP]] server declarations, model selection, environment variables, and more. The official JSON schema is hosted on SchemaStore at `https://json.schemastore.org/claude-code-settings.json`, enabling autocomplete and inline validation in VS Code, Cursor, and other schema-aware editors. [[CLAUDE.md File]] files follow the same scope hierarchy, stored at `~/.claude/CLAUDE.md` (user), `CLAUDE.md` or `.claude/CLAUDE.md` (project), and `CLAUDE.local.md` (local).

Managed settings can be delivered through three mechanisms: server-side via the [[Source - Claude Code Server-Managed Settings|Claude.ai admin console]], MDM/OS-level policies (macOS managed preferences domain `com.anthropic.claudecode`, Windows registry key `HKLM\SOFTWARE\Policies\ClaudeCode`), or file-based drop-in directories (`/Library/Application Support/ClaudeCode/` on macOS, `/etc/claude-code/` on Linux). The drop-in directory pattern (`managed-settings.d/`) lets separate teams deploy independent policy fragments without editing a shared file; fragments are merged alphabetically with later files taking precedence for scalar values while arrays are concatenated and deduplicated.

Several settings are only recognized when placed in managed settings: `allowManagedPermissionRulesOnly`, `allowManagedMcpServersOnly`, `allowManagedHooksOnly`, `forceRemoteSettingsRefresh`, `channelsEnabled`, `allowedChannelPlugins`, `blockedMarketplaces`, and sandbox managed-path controls. Additional global config (OAuth session, MCP configurations, per-project tool trust) lives in `~/.claude.json`, which [[Claude Code]] automatically backs up with timestamped copies retaining the five most recent.

## Key Topics

- Four configuration scopes and their precedence order (Managed > Local > Project > User)
- `settings.json` schema: permissions, hooks, model, env, MCP, sandbox, attribution, companyAnnouncements
- SchemaStore JSON schema for editor autocomplete and validation
- Three managed-settings delivery mechanisms: server, MDM/OS policies, file-based drop-in directories
- Drop-in directory (`managed-settings.d/`) merge behavior for multi-team policy fragments
- Managed-only settings keys that have no effect outside managed scope
- `~/.claude.json` global config for OAuth, MCP servers, per-project state, and caches
- Automatic timestamped backup of configuration files (five most recent retained)
