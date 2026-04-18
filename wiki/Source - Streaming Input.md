---
title: "Source - Streaming Input"
type: source
date: 2026-04-17
source_file: "raw/streaming-input.md"
tags: [agent-sdk, streaming, input-modes, sessions]
---

This source from the [[Claude Code]] official documentation explains the two input modes for the [[Agent SDK]]: Streaming Input Mode (the default and recommended approach) and Single Message Input.

Streaming Input Mode provides a persistent, interactive session where the agent operates as a long-lived process. It takes in user input, handles interruptions, surfaces permission requests, and manages sessions. The mode uses an AsyncGenerator pattern where the application yields messages to the agent and receives streamed responses. Key benefits include image upload support (attaching images directly to messages for visual analysis), queued messages (sending multiple messages that process sequentially with ability to interrupt), full tool integration with [[MCP]] servers, [[Hooks]] support for lifecycle customization, real-time streaming feedback as responses are generated, and context persistence across multiple turns.

The implementation uses `ClaudeSDKClient` in Python (with `client.query()` accepting an async generator) and the `query()` function in TypeScript (accepting a generator function). Messages can include text content or multipart content with images encoded as base64.

Single Message Input is simpler but more limited. It is appropriate for one-shot responses, scenarios not requiring image attachments or hooks, and stateless environments like lambda functions. It does not support direct image attachments, dynamic message queueing, real-time interruption, hook integration, or natural multi-turn conversations. The implementation uses `query()` with a string prompt and `continue: true` for session continuation in TypeScript, or `ClaudeAgentOptions` with `continue_conversation=True` in Python.

The document presents both modes with complete code examples in Python and TypeScript, showing the full lifecycle including initialization, message sending, and response processing.

## Key Topics
- Streaming Input Mode as the default and recommended [[Agent SDK]] approach
- AsyncGenerator pattern for persistent interactive sessions
- Image upload support via base64 encoding in streaming mode
- Queued messages with sequential processing and interruption
- Full tool and [[MCP]] server integration in streaming mode
- [[Hooks]] support for lifecycle customization
- Single Message Input for one-shot stateless queries
- `ClaudeSDKClient` (Python) vs `query()` function (TypeScript)
- `continue: true` / `continue_conversation=True` for session continuation
- Limitations of single message mode: no images, hooks, or dynamic queueing
