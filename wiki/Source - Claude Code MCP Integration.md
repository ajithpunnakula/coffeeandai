---
title: "Source - Claude Code MCP Integration"
type: source
date: 2026-04-13
source_file: "raw/connect-claude-code-to-tools-via-mcp.md"
tags: [claude-code, extensions]
---

# Source - Claude Code MCP Integration

[[Claude Code]] integrates with external services and tools through the [[MCP]] (Model Context Protocol). MCP servers expose tools that Claude can use to query databases, post to Slack, control browsers, interact with APIs, and more. Claude Code supports three transport types: HTTP (streamable HTTP, the recommended option for remote servers), SSE (deprecated), and stdio (for local process-based servers). Servers are added with the `claude mcp add` CLI command, specifying the transport and connection details.

MCP connections follow a scope hierarchy that determines priority: local scope (project-level, not shared) > project scope (`.mcp.json`, committed to the repo) > user scope (`~/.claude/.mcp.json`, available across all projects). When multiple scopes define a server with the same name, the higher-priority scope wins. MCP tool search is enabled by default: at session start only tool names load into context, with full JSON schemas deferred until Claude actually needs a specific tool. This keeps idle MCP servers from consuming significant context. The `/mcp` command shows connected servers, their tools, and token costs per server.

The Anthropic MCP registry (at `api.anthropic.com/mcp-registry`) catalogs available servers with metadata on transport type, required environment variables, and compatibility. The Channels feature allows MCP servers to push messages into active sessions, enabling real-time notifications and streaming updates from external systems. MCP connections can fail silently mid-session — if a server disconnects, its tools disappear without warning, and Claude may attempt to use tools that no longer exist. The `/mcp` command can diagnose these issues.

[[Plugins]] can bundle pre-configured MCP servers via `.mcp.json` in the plugin root, so users get external integrations without manual setup. The distinction between MCP and [[Skills]] is important: MCP gives Claude the ability to interact with external systems, while skills give Claude knowledge about how to use those systems effectively (schema documentation, query patterns, workflow guidance). These are complementary and work well together.

## Key Topics

- Three transport types: HTTP (recommended), SSE (deprecated), stdio (local)
- `claude mcp add` CLI command for adding servers
- Scope hierarchy: local > project > user
- MCP tool search: names at session start, schemas deferred until use
- `/mcp` command: view servers, tools, and token costs
- Channels feature: MCP servers push messages into sessions
- Anthropic MCP registry at `api.anthropic.com/mcp-registry`
- Silent disconnection risk and how to diagnose with `/mcp`
- Plugin-bundled MCP servers (pre-configured, no manual setup)
- MCP vs Skills: external access vs knowledge about how to use it
