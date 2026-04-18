---
title: "Source - Agent SDK Reference TypeScript"
type: source
date: 2026-04-17
source_file: "raw/agent-sdk-reference-typescript.md"
tags: [agent-sdk, typescript, api-reference]
---

The TypeScript [[Agent SDK]] reference documents the complete API for the `@anthropic-ai/claude-agent-sdk` npm package. It covers the primary `query()` function, the `startup()` pre-warming function, custom tool creation with `tool()`, and MCP server creation with `createSdkMcpServer()`.

The `query()` function is the main entry point, returning a `Query` object that extends `AsyncGenerator<SDKMessage, void>` with additional methods for mid-session control. It accepts a prompt (string or `AsyncIterable<SDKUserMessage>` for streaming input) and an `Options` object. The `startup()` function enables pre-warming by spawning the CLI subprocess and completing the initialization handshake before a prompt is ready, reducing latency on the first call.

The `Options` type provides extensive configuration: `model`, `systemPrompt` (string or preset object with optional `append` and `excludeDynamicSections`), `allowedTools`, `disallowedTools`, `permissionMode`, `maxTurns`, `maxBudgetUsd`, `effort` (defaults to `"high"` in TypeScript), `mcpServers`, `hooks`, `agents`, `outputFormat`, `settingSources`, and `cwd`. The TypeScript SDK also supports `canUseTool` callbacks for interactive approval, `sandboxSettings` for container-based execution, and the `auto` permission mode that uses a model classifier.

Message types mirror the Python SDK but use string-based type discriminators. The TypeScript SDK defines `SDKSystemMessage`, `SDKAssistantMessage`, `SDKUserMessage`, `SDKPartialAssistantMessage` (for streaming), `SDKResultMessage`, and `SDKCompactBoundaryMessage`. Additional observability events include hook events, tool progress, rate limit notifications, and task completion markers. The `Query` object also exposes methods like `abort()`, `setPermissionMode()`, and `setOutputStyle()` for runtime control.

Custom tools use Zod schemas (supporting both Zod 3 and Zod 4) for type-safe input definitions. The `tool()` function wraps a handler with schema validation, and `createSdkMcpServer()` assembles tools into in-process [[MCP]] servers. Session management is available via `listSessions()` and `getSessionMessages()` for transcript retrieval.

## Key Topics

- `query()` function returning an async generator with control methods
- `startup()` for pre-warming subprocess initialization
- `Options` type with full configuration surface
- `SDKMessage` union type and TypeScript-specific message types
- `tool()` with Zod schema support for custom [[MCP]] tools
- `createSdkMcpServer()` for in-process MCP servers
- `Query` object methods: `abort()`, `setPermissionMode()`, `setOutputStyle()`
- `listSessions()` and `getSessionMessages()` for session management
- TypeScript-specific features: `auto` [[Permission Modes]], sandbox settings
- `SDKCompactBoundaryMessage` for context compaction events
- Streaming via `includePartialMessages` option
