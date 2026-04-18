---
title: "MCP"
type: concept
tags: [architecture, extensions, claude-code]
sources: ["raw/connect-claude-code-to-tools-via-mcp.md", "raw/extend-claude-code.md", "raw/claude-code-overview.md", "raw/connect-to-external-tools-with-mcp.md", "raw/tool-design-mcp-integration.md"]
---

# MCP

The Model Context Protocol (MCP) is an open standard created by [[Anthropic]] for connecting AI assistants to external data sources, tools, and services. The spec is published at modelcontextprotocol.io. In [[Claude Code]], MCP is the primary extension mechanism — virtually every integration with external systems (databases, APIs, communication tools, code intelligence services) is implemented as an MCP server.

MCP servers communicate over one of three transport types: HTTP (recommended for remote servers, supports authentication and network routing), SSE / Server-Sent Events (deprecated, being replaced by HTTP), and stdio (local processes spawned by Claude Code directly, suitable for local tools). Servers are configured with `claude mcp add` via the CLI, and a scope hierarchy determines precedence: local (project-specific, `.claude/mcp.json`) overrides project (checked-in, `mcp.json`) overrides user (global, `~/.claude/mcp.json`).

A key performance feature is MCP tool search (enabled by default): rather than loading the full schema for every tool on every MCP server at session start, Claude Code defers fetching tool schemas until it determines a server's tools are relevant. This can significantly reduce [[Context Window]] consumption when many MCP servers are configured. MCP servers can also expose prompts, which appear as `/mcp__<server>__<prompt>` slash commands in the [[Claude Code]] interface.

[[Anthropic]] maintains an MCP registry at `api.anthropic.com/mcp-registry` for discovering published servers. Several [[Claude Code]] subsystems are implemented using the MCP protocol internally: [[Computer Use]] is exposed as a built-in MCP server, [[Claude in Chrome]] connects via MCP, and [[Channels]] are MCP servers that additionally declare a `claude/channel` capability. [[Plugins]] can bundle and configure MCP servers as part of their distribution. See also [[Subagents]] (which can expose their own MCP interfaces) and [[Agent Teams]] (which coordinate via MCP tool calls).
