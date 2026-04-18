---
title: "Source - Tool Use with Claude"
type: source
date: 2026-04-17
source_file: "raw/tool-use-with-claude.md"
tags: [api, tool-use, agents]
---

This source is [[Anthropic]]'s official documentation overview for tool use with Claude, explaining how to connect Claude to external tools and APIs. Tool use lets Claude call functions that developers define or that [[Anthropic]] provides, with Claude deciding when to call a tool based on the user's request and the tool's description.

The documentation distinguishes between two types of tools based on where code executes. Client tools (including user-defined tools and Anthropic-schema tools like bash and text_editor) run in the developer's application: Claude responds with `stop_reason: "tool_use"` and one or more `tool_use` blocks, the developer's code executes the operation, and a `tool_result` is sent back. Server tools (web_search, code_execution, web_fetch, tool_search) run on [[Anthropic]]'s infrastructure, with results returned directly without developer-side handling.

The source highlights that tool access is one of the highest-leverage primitives for agents, citing benchmarks like LAB-Bench FigQA (scientific figure interpretation) and SWE-bench (real-world software engineering) where adding even basic tools produces outsized capability gains that often surpass human expert baselines. A strict mode (`strict: true`) can be added to tool definitions to ensure Claude's tool calls always match the schema exactly.

Regarding model behavior with missing parameters, Claude Opus is much more likely to recognize missing required parameters and ask for clarification, while Claude Sonnet may attempt to infer reasonable values. For example, given a `get_weather` tool without a specified location, Sonnet might guess "New York, NY" rather than asking.

Pricing for tool use is based on total input tokens (including the `tools` parameter), output tokens, and for server-side tools, additional usage-based pricing. The documentation provides a detailed table of tool use system prompt token counts by model and tool_choice setting, showing that tool definitions add overhead tokens (e.g., 346 tokens for `auto`/`none` and 313 tokens for `any`/`tool` on most current models). The source links to tutorials, concept explanations, and the [[MCP]] connector for MCP server integration.

## Key Topics

- Client tools versus server tools based on execution location
- [[Agentic Loop]] with stop_reason "tool_use" for client-side tool execution
- Server tools: web_search, code_execution, web_fetch, tool_search
- Strict mode (`strict: true`) for guaranteed schema conformance
- Model-specific behavior for missing parameters (Opus asks, Sonnet infers)
- Tool use token overhead per model and tool_choice setting
- Benchmark improvements: LAB-Bench FigQA and SWE-bench
- Pricing based on input tokens, output tokens, and server tool usage
- [[MCP]] connector for MCP server integration
- Tool definitions as input token overhead in API requests
