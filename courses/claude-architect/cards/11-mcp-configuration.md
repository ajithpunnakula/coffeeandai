---
id: card_a8d2e6f9
type: page
order: 11
difficulty: 2
title: "MCP Server Configuration"
domain: "Tool Design & MCP Integration"
wiki_refs: ["MCP", "Claude Code"]
source: "raw/tool-design-mcp-integration.md"
speaker_notes: "Walk through the two-level MCP configuration system. The key exam distinction is project-level versus user-level: .mcp.json is checked into version control and shared with the team, while ~/.claude.json is personal. The critical security rule is never hardcoding API keys — always use the dollar-sign curly-brace ENV_VAR syntax. Then cover the six built-in tools and why purpose-built tools should always be preferred over Bash workarounds. The Read-over-cat and Edit-over-Write distinctions are frequent exam distractors."
content_hashes:
  "MCP": "a67a9de9"
  "Claude Code": "7ebc57e4"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_a8d2e6f9-57UVdYV16IW08Xx5scgtQeDnouQBfI.mp3"
---

# MCP Server Configuration

The Model Context Protocol ([[MCP]]) is the standard interface for connecting [[Claude Code]] to external tools and data sources. Understanding the configuration hierarchy and security model is essential for both the exam and production deployments.

## Two-Level Configuration

MCP uses a two-level configuration system:

| Level | File | Scope | Version controlled? |
|---|---|---|---|
| **Project** | `.mcp.json` | Shared with team, lives in repo root | Yes |
| **User** | `~/.claude.json` | Personal settings, machine-specific | No |

Project-level configuration in `.mcp.json` is the standard for team settings — it travels with the repository and works in CI/CD pipelines. User-level configuration in `~/.claude.json` is for personal preferences and credentials that should never be committed.

## Secret Management

**NEVER hardcode API keys** in `.mcp.json` or any version-controlled file. Use the environment variable interpolation syntax:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["my-mcp-server"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

The `${ENV_VAR}` syntax pulls values from the shell environment at runtime. This keeps secrets out of git history entirely.

## Six Built-In Tools

Claude Code ships with six purpose-built tools that should always be preferred over Bash equivalents:

1. **Read** — Read file contents (prefer over `Bash('cat file')`)
2. **Write** — Create or overwrite files
3. **Edit** — Modify existing files with surgical replacements (prefer over Write for changes)
4. **Bash** — Execute shell commands (use only when no purpose-built tool fits)
5. **Grep** — Search file contents with regex (prefer over `Bash('grep ...')`)
6. **Glob** — Find files by pattern (prefer over `Bash('find ...')`)

The exam tests whether you know to use purpose-built tools. Using `Bash('cat config.json')` instead of `Read('config.json')` is a documented anti-pattern — it bypasses safety checks and produces less structured output.
