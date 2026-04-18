---
title: "Source - Stream Responses in Real-Time"
type: source
date: 2026-04-17
source_file: "raw/stream-responses-in-real-time.md"
tags: [agent-sdk, streaming, real-time]
---

This source documents real-time output streaming in the [[Agent SDK]], enabling developers to receive incremental text and tool call updates as they are generated rather than waiting for complete responses.

By default, the SDK yields complete `AssistantMessage` objects after Claude finishes each response. Enabling partial message streaming via `include_partial_messages` (Python) or `includePartialMessages` (TypeScript) causes the SDK to additionally yield `StreamEvent` messages containing raw API events. In Python, `StreamEvent` is imported from `claude_agent_sdk.types`; in TypeScript, it appears as `SDKPartialAssistantMessage` with `type: 'stream_event'`.

The `StreamEvent.event` field contains raw Claude API streaming events. The key event types are: `message_start` (new message beginning), `content_block_start` (new text or tool_use block), `content_block_delta` (incremental content updates), `content_block_stop` (block completion), `message_delta` (message-level updates like stop reason and usage), and `message_stop` (message end). For text streaming, developers check for `content_block_delta` events where `delta.type` is `text_delta`. For tool call streaming, `content_block_start` signals a new tool, `input_json_delta` events carry accumulated JSON input, and `content_block_stop` marks completion.

The message flow with streaming enabled follows a pattern: StreamEvents for the complete message lifecycle, then a complete `AssistantMessage`, then tool execution, then more streaming events for the next turn, and finally a `ResultMessage`. Without partial messages, developers receive `SystemMessage`, `AssistantMessage`, `ResultMessage`, and compact boundary messages.

The source includes a streaming UI example that tracks whether the agent is currently executing a tool using an `in_tool` flag, showing status indicators like `[Using Read...]` during tool execution. Two known limitations are noted: [[Extended Thinking]] (when `maxThinkingTokens` is explicitly set) disables StreamEvent emission, and structured output appears only in the final `ResultMessage.structured_output`, not as streaming deltas.

## Key Topics

- `includePartialMessages` / `include_partial_messages` to enable streaming
- `StreamEvent` / `SDKPartialAssistantMessage` message types
- Raw Claude API streaming events (message_start, content_block_delta, etc.)
- Text streaming via `text_delta` events
- Tool call streaming via `input_json_delta` events
- Message flow with and without partial messages
- Streaming UI pattern with tool execution status tracking
- [[Extended Thinking]] incompatibility with StreamEvent emission
- Structured output not available as streaming deltas
- `AssistantMessage` still yielded as complete objects alongside StreamEvents
- Real-time progress display for multi-step agent tasks
