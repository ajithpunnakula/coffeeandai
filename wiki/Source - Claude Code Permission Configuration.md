---
title: "Source - Claude Code Permission Configuration"
type: source
date: 2026-04-13
source_file: "raw/configure-permissions.md"
tags: [claude-code, security, configuration]
---

# Source - Claude Code Permission Configuration

[[Claude Code]] uses a tiered permission system evaluated in a fixed precedence order: **deny rules win first**, then **ask rules**, then **allow rules**. Rules are managed via `/permissions` and stored in `settings.json` at any scope. The three rule types are: **Allow** (tool runs without prompting), **Ask** (always prompts), and **Deny** (tool is blocked outright). Read-only operations (file reads, grep) never require approval; Bash commands require approval and can be permanently approved per project directory and command; file modifications require approval until the end of the session.

Permission rules follow the syntax `Tool` or `Tool(specifier)`. Bash rules support glob wildcards at any position in the command—`Bash(npm run *)` matches any npm run command while `Bash(ls *)` matches `ls -la` but not `lsof` (space before `*` enforces a word boundary). Read and Edit rules follow gitignore-style path patterns: `//path` for absolute filesystem paths, `~/path` for home-relative, `/path` for project-root-relative, and `path` or `./path` for cwd-relative. WebFetch rules use `WebFetch(domain:example.com)`. MCP tools use `mcp__<server>__<tool>` syntax. Agent (subagent) rules use `Agent(SubagentName)`. A critical warning: Read and Edit deny rules apply only to Claude's built-in file tools, not to Bash subprocesses—`cat .env` in Bash is not blocked by `Read(./.env)`; [[Sandboxing]] is required for OS-level enforcement.

[[Hooks]] provide a runtime extension to the permission system. `PreToolUse` hooks run before the permission prompt and can deny the tool call (exit code 2), force a prompt, or skip the prompt (allow). A hook returning "allow" does not bypass deny rules—those still apply afterward. A blocking hook overrides allow rules, enabling patterns like "allow all Bash except these specific commands" by combining `Bash` in the allow list with a `PreToolUse` hook that rejects dangerous variants.

Enterprise managed settings support a set of managed-only keys for locking down policy. `allowManagedPermissionRulesOnly: true` prevents user and project settings from defining any allow/ask/deny rules. `disableBypassPermissionsMode: "disable"` and `disableAutoMode: "disable"` block those [[Permission Modes]] organization-wide. The auto mode classifier is configurable via `autoMode.environment`, `autoMode.allow`, and `autoMode.soft_deny` prose-based natural-language rules, sourced from user settings, local settings, and managed settings (not shared project settings, to prevent repo-injected allow rules). Setting `allow` or `soft_deny` replaces the entire built-in default list, so `claude auto-mode defaults` should be run first to copy the defaults before editing.

## Key Topics

- Three-tier rule evaluation: deny > ask > allow (first matching rule wins)
- Rule syntax: `Tool`, `Tool(specifier)`, glob wildcards for Bash, gitignore patterns for Read/Edit
- Bash wildcard nuance: space before `*` enforces word boundary
- Four path prefix types for Read/Edit rules: `//` (absolute), `~/` (home), `/` (project-root), none (cwd)
- WebFetch domain rules: `WebFetch(domain:example.com)`
- MCP tool rules: `mcp__<server>__<tool>` pattern
- Agent/subagent rules: `Agent(SubagentName)` in deny list
- Hooks as runtime permission extension: PreToolUse hooks, exit code 2 for blocking
- Managed-only settings: `allowManagedPermissionRulesOnly`, `disableBypassPermissionsMode`
- Auto mode classifier config: `autoMode.environment`, `.allow`, `.soft_deny` (prose rules)
- `claude auto-mode defaults` / `config` / `critique` subcommands
- Defense-in-depth: combining permissions with [[Sandboxing]]
- Working directories and `additionalDirectories` for extending file access
