---
title: "Source - Migrate to Claude Agent SDK"
type: source
date: 2026-04-17
source_file: "raw/migrate-to-claude-agent-sdk.md"
tags: [agent-sdk, migration, breaking-changes]
---

This source provides the migration guide for transitioning from the Claude Code SDK to the renamed [[Agent SDK]]. The rename reflects the SDK's evolution from a coding-focused tool to a general-purpose framework for building AI agents across any domain -- business agents, specialized coding agents, customer support, and more.

The package names have changed: TypeScript moved from `@anthropic-ai/claude-code` to `@anthropic-ai/claude-agent-sdk`, and Python from `claude-code-sdk` to `claude-agent-sdk`. Documentation has been reorganized from the [[Claude Code]] docs to a dedicated Agent SDK section in the API Guide. The migration steps for both languages involve uninstalling the old package, installing the new one, and updating imports.

Three breaking changes are documented in version v0.1.0. First, in Python, `ClaudeCodeOptions` was renamed to `ClaudeAgentOptions` to match the new branding. Second, the SDK no longer uses [[Claude Code]]'s system prompt by default -- it now uses a minimal system prompt containing only essential tool instructions. To restore the old behavior, developers must explicitly request the `claude_code` preset via `systemPrompt: { type: "preset", preset: "claude_code" }`. Third, settings sources (including [[CLAUDE.md File]], `settings.json`, slash commands, and other filesystem configurations) are no longer loaded by default, improving isolation for CI/CD environments, deployed applications, testing, and multi-tenant systems.

The document includes a warning that current SDK releases have reverted the settings sources default for `query()` -- omitting the option once again loads user, project, and local settings. Developers needing isolated behavior must explicitly pass `settingSources: []` (TypeScript) or `setting_sources=[]` (Python). Python SDK 0.1.59 and earlier treated an empty list the same as omitting the option, so an upgrade is required before relying on the empty-list behavior.

## Key Topics

- Package rename from Claude Code SDK to [[Agent SDK]]
- TypeScript: `@anthropic-ai/claude-code` to `@anthropic-ai/claude-agent-sdk`
- Python: `claude-code-sdk` to `claude-agent-sdk`
- `ClaudeCodeOptions` renamed to `ClaudeAgentOptions`
- Default system prompt changed from [[Claude Code]] preset to minimal
- Settings sources no longer loaded by default (then reverted)
- `settingSources: []` for isolated/multi-tenant deployments
- Breaking changes in v0.1.0
- Import path updates for both languages
- [[CLAUDE.md File]] loading now controlled by `settingSources`
