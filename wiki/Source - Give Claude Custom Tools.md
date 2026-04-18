---
title: "Source - Give Claude Custom Tools"
type: source
date: 2026-04-17
source_file: "raw/give-claude-custom-tools.md"
tags: [agent-sdk, custom-tools, mcp, tools]
---

This source provides a comprehensive guide to defining custom tools within the [[Agent SDK]] using in-process [[MCP]] servers. Custom tools let developers give Claude access to databases, external APIs, domain-specific logic, or any other capability by defining functions with input schemas and handlers, then bundling them into an MCP server passed to `query()`.

A tool is defined by four parts: a name (unique identifier), description (read by Claude to decide when to call it), input schema (arguments Claude must provide), and handler (async function that executes when called). In TypeScript, input schemas use Zod; in Python, they use either a simple dict mapping names to types or a full JSON Schema dict for complex cases like enums, ranges, and nested objects. Tools are wrapped in an in-process MCP server using `createSdkMcpServer` (TypeScript) or `create_sdk_mcp_server` (Python).

The document covers tool annotations, which are optional metadata describing tool behavior. The `readOnlyHint` annotation is particularly important because it controls whether a tool can be called in parallel with other read-only tools. Other annotations include `destructiveHint`, `idempotentHint`, and `openWorldHint`. The source emphasizes that annotations are metadata, not enforcement.

Error handling follows a key principle: throwing an uncaught exception stops the [[Agentic Loop]], while returning `isError: true` allows the loop to continue with Claude seeing the error as data. The document also covers returning non-text content (images as base64-encoded blocks, resources as URI-identified content blocks) and controlling tool access through the layered system of `tools` (availability), `allowedTools` (permission), and `disallowedTools` (denial).

## Key Topics

- Custom tools defined with name, description, input schema, and async handler
- In-process MCP servers via `createSdkMcpServer` / `create_sdk_mcp_server`
- Tool naming convention: `mcp__{server_name}__{tool_name}`
- Tool annotations: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`
- Error handling: `isError: true` keeps the [[Agentic Loop]] alive; uncaught exceptions stop it
- Non-text return types: image blocks (base64) and resource blocks (URI-identified content)
- Three-layer tool access: `tools` (availability), `allowedTools` (permission), `disallowedTools` (denial)
- TypeScript uses Zod schemas; Python uses dict or JSON Schema for input definitions
- Tool search recommended for servers with dozens of tools
