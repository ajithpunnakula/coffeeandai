---
title: "Source - TypeScript SDK V2 Interface Preview"
type: source
date: 2026-04-17
source_file: "raw/typescript-sdk-v2-interface-preview.md"
tags: [agent-sdk, typescript, v2-preview, api-design]
---

This source introduces the V2 preview interface for the TypeScript [[Agent SDK]], which simplifies multi-turn conversations by replacing async generators with explicit `send()`/`stream()` cycles. The V2 interface is marked as unstable and some features like session forking remain V1-only.

The V2 API surface reduces to three core concepts: `unstable_v2_createSession()` / `unstable_v2_resumeSession()` for starting or continuing conversations, `session.send()` for dispatching messages, and `session.stream()` for receiving responses. This explicit separation makes it easier to add logic between turns compared to V1's single async generator approach.

For simple single-turn queries, `unstable_v2_prompt()` provides a convenience function that returns a `Promise<SDKResultMessage>` directly. For multi-turn conversations, developers create a session, call `send()` with each message, then iterate `stream()` for the response. Context persists across turns within a session -- Claude remembers previous exchanges.

Session resumption is supported: developers capture the session ID from any received message, store it, then call `unstable_v2_resumeSession(sessionId, options)` to continue later. This enables long-running workflows and persistence across application restarts.

The `SDKSession` interface exposes `readonly sessionId`, `send(message)`, `stream()`, and `close()`. Sessions support automatic cleanup via TypeScript 5.2+'s `await using` syntax for automatic resource management, or manual cleanup via `session.close()`.

The document contrasts V2 with V1 for each use case, showing how V1 requires managing generator state and input coordination for multi-turn conversations. V2's explicit send/stream separation eliminates this complexity. The V2 interface is included in the existing `@anthropic-ai/claude-agent-sdk` package with no separate installation required.

## Key Topics

- V2 preview interface for the TypeScript [[Agent SDK]]
- `unstable_v2_createSession()` and `unstable_v2_resumeSession()` functions
- `session.send()` / `session.stream()` pattern for multi-turn conversations
- `unstable_v2_prompt()` convenience function for single-turn queries
- `SDKSession` interface (sessionId, send, stream, close)
- Session resumption via stored session IDs
- TypeScript 5.2+ `await using` for automatic cleanup
- Comparison with V1 async generator approach
- Unstable/preview status with potential API changes
- Session forking not yet available in V2
- Explicit turn separation simplifying inter-turn logic
