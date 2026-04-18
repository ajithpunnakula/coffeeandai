---
title: "Source - Scale to Many Tools with Tool Search"
type: source
date: 2026-04-17
source_file: "raw/scale-to-many-tools-with-tool-search.md"
tags: [agent-sdk, tool-search, scalability, context-management]
---

This source documents the tool search feature in the [[Agent SDK]], which enables agents to work with hundreds or thousands of tools by dynamically discovering and loading them on demand rather than placing all tool definitions in the context window upfront. Tool search addresses two scaling challenges: context efficiency (50 tools can consume 10-20K tokens) and tool selection accuracy degradation with more than 30-50 tools loaded simultaneously.

When tool search is active, tool definitions are withheld from the [[Context Window]]. The agent receives a summary of available tools and searches for relevant ones when the task requires an unloaded capability. The 3-5 most relevant tools are loaded into context and remain available for subsequent turns. If conversation compaction removes previously discovered tools, the agent searches again as needed. Tool search adds one extra round-trip on first discovery but reduces context size on every turn.

Tool search is enabled by default and configured via the `ENABLE_TOOL_SEARCH` environment variable. The options include: always on (default/unset or `true`), `auto` (activates when tool definitions exceed 10% of context window), `auto:N` (custom threshold percentage), and `false` (disabled, all tools loaded upfront). The `auto` mode checks combined token count across all registered tools from both remote [[MCP]] servers and custom SDK MCP servers.

The document provides optimization guidance: descriptive tool names like `search_slack_messages` surface better than generic names like `query_slack`, and descriptions with specific keywords improve matching. Adding a system prompt section listing available tool categories helps the agent know what to search for. Limits include a maximum of 10,000 tools in the catalog, 3-5 search results per query, and model requirements of Claude Sonnet 4 or later (no Haiku support).

## Key Topics

- Tool search dynamically discovers and loads tools on demand instead of upfront loading
- Solves context efficiency (50 tools = 10-20K tokens) and selection accuracy degradation (>30-50 tools)
- Enabled by default; configured via `ENABLE_TOOL_SEARCH` environment variable
- Modes: always on, `auto` (10% threshold), `auto:N` (custom threshold), `false` (disabled)
- Returns 3-5 most relevant tools per search query
- Maximum 10,000 tools supported in the catalog
- Requires Claude Sonnet 4 or later; Haiku not supported
- Descriptive tool names and keyword-rich descriptions improve discovery
- Applies to both remote [[MCP]] servers and custom SDK MCP servers
- Previously discovered tools may be removed during conversation compaction
