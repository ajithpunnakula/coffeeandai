---
title: "Source - Claude Code Programmatic Mode"
type: source
date: 2026-04-13
source_file: "raw/run-claude-code-programmatically.md"
tags: [claude-code, automation]
---

# Source - Claude Code Programmatic Mode

[[Claude Code]] can be run non-interactively via the `-p` (or `--print`) flag, enabling use in scripts, CI/CD pipelines, and shell automation. This CLI entry point is part of the [[Agent SDK]], which also provides Python and TypeScript packages for full programmatic control. The `-p` flag was previously called "headless mode" but the `-p` flag and all CLI options remain unchanged. All standard CLI options work with `-p`, including `--continue`/`--resume` for session continuation, `--allowedTools` for tool pre-approval, and `--output-format` for structured output.

The `--bare` flag skips auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md files, providing a clean reproducible environment suitable for CI. In bare mode, only explicitly passed flags take effect — no local configuration is picked up from the working directory or `~/.claude`. Bare mode also skips OAuth and keychain reads, requiring authentication via `ANTHROPIC_API_KEY` or an `apiKeyHelper` in the `--settings` JSON. Anthropic notes that `--bare` will become the default for `-p` in a future release.

Structured output is controlled via `--output-format`: `text` (default) returns plain text, `json` returns a structured object with result, session ID, and metadata, and `stream-json` returns newline-delimited JSON events for real-time streaming. The `--json-schema` flag combined with `--output-format json` constrains the response to a specific JSON Schema, with the structured output appearing in the `structured_output` field. Tool pre-approval uses the `--allowedTools` flag with [[Source - Claude Code Permission Configuration|Permission Rule Syntax]] (supporting prefix matching with a trailing ` *`). Permission modes (`dontAsk`, `acceptEdits`) can also be set via `--permission-mode` to establish a baseline for the whole session. Session continuation is handled with `--continue` (most recent conversation) or `--resume <session-id>` (specific conversation).

The API retry event (`system/api_retry`) is emitted as a stream-json event when a retryable error occurs, providing fields for attempt number, max retries, retry delay in milliseconds, error status code, and error category. Skills and built-in commands (like `/commit`) are not available in `-p` mode — tasks must be described directly in the prompt instead.

## Key Topics

- `-p` / `--print` flag for non-interactive scripting and CI
- `--bare` mode: skips local config discovery for reproducible runs; future default for `-p`
- `--output-format`: `text`, `json`, `stream-json` output modes
- `--json-schema` for schema-constrained structured output
- `--allowedTools` with permission rule syntax and prefix matching
- `--permission-mode` (`dontAsk`, `acceptEdits`) for session-level baselines
- `--continue` and `--resume` for multi-turn scripted conversations
- `--append-system-prompt` / `--system-prompt` for prompt customization
- `system/api_retry` stream event for retry visibility
- Part of the broader Agent SDK (also Python and TypeScript packages)
- Skills and built-in commands unavailable in `-p` mode
