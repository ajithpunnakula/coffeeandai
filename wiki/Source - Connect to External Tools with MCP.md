---
title: "Source - Connect to External Tools with MCP"
type: source
date: 2026-04-17
source_file: "raw/connect-to-external-tools-with-mcp.md"
tags: [agent-sdk, mcp, tools, integration]
---

This source documents how to configure [[MCP]] (Model Context Protocol) servers within the [[Agent SDK]] to connect agents to external tools and data sources. MCP is an open standard that allows agents to query databases, integrate with APIs like Slack and GitHub, and connect to other services without writing custom tool implementations.

MCP servers can be configured either in code via the `mcpServers` option in `query()` or through a `.mcp.json` configuration file loaded via `settingSources`. The document covers three transport types: stdio servers (local processes communicating via stdin/stdout), HTTP/SSE servers (for cloud-hosted MCP servers and remote APIs), and SDK MCP servers (custom tools defined directly in application code). Each transport type has distinct configuration patterns and use cases.

A critical requirement is that MCP tools need explicit permission through `allowedTools` before Claude can use them. Tools follow the naming convention `mcp__<server-name>__<tool-name>`, and wildcards (`mcp__github__*`) can grant access to all tools from a specific server. The document recommends using `allowedTools` over [[Permission Modes]] for MCP access, noting that `permissionMode: "acceptEdits"` does not auto-approve MCP tools and `permissionMode: "bypassPermissions"` is overly broad.

The source covers authentication patterns including environment variable injection for stdio servers, HTTP headers for remote servers, and OAuth2 support. It also discusses tool search integration, which is enabled by default and dynamically loads only the tools Claude needs to conserve context window space. Error handling is addressed through the `system/init` message, which includes connection status for each MCP server.

## Key Topics

- [[MCP]] is an open standard for connecting AI agents to external tools and data sources
- Three transport types: stdio (local processes), HTTP/SSE (remote servers), SDK MCP servers (in-process)
- MCP tools require explicit permission via `allowedTools` with `mcp__<server>__<tool>` naming
- Wildcard patterns (`mcp__server__*`) grant access to all tools from a server
- Configuration via code (`mcpServers` option) or `.mcp.json` file
- Authentication via environment variables, HTTP headers, or OAuth2 tokens
- Tool search enabled by default to handle large tool sets efficiently
- Error handling through `system/init` message status checking
- Prefer `allowedTools` over [[Permission Modes]] for MCP tool access control
