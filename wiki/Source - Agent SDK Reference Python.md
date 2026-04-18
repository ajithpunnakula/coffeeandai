---
title: "Source - Agent SDK Reference Python"
type: source
date: 2026-04-17
source_file: "raw/agent-sdk-reference-python.md"
tags: [agent-sdk, python, api-reference]
---

The Python [[Agent SDK]] reference provides the complete API documentation for the `claude-agent-sdk` Python package. It covers two primary interfaces for interacting with Claude: the `query()` function and the `ClaudeSDKClient` class, each suited to different use cases.

The `query()` function creates a new session for each interaction and returns an `AsyncIterator[Message]`. It is best for one-off tasks and simple automation scripts. The `ClaudeSDKClient` class maintains a persistent session across multiple exchanges, supporting continued conversations, follow-up questions, and interactive applications. It additionally supports interrupts for mid-stream control.

Configuration is handled through `ClaudeAgentOptions`, which exposes fields for `system_prompt`, `permission_mode`, `allowed_tools`, `disallowed_tools`, `max_turns`, `max_budget_usd`, `effort`, `model`, `cwd`, `mcp_servers`, `hooks`, `agents` (for [[Subagents]]), `output_format` (for structured output), and `setting_sources` (controlling which filesystem settings to load). The `setting_sources` option can include `"user"`, `"project"`, and `"local"` to load [[CLAUDE.md File]] content, [[Skills]], [[Hooks]], and permission rules from the filesystem.

The SDK defines several message types: `SystemMessage` (session lifecycle events), `AssistantMessage` (Claude's responses including text and tool calls), `UserMessage` (tool results and user inputs), `StreamEvent` (raw API streaming events when partial messages are enabled), and `ResultMessage` (final outcome with cost, usage, and session ID). The `ResultMessage.subtype` field indicates whether the task succeeded or hit a limit.

Custom tools are defined using the `@tool` decorator and can be assembled into in-process [[MCP]] servers via `create_sdk_mcp_server()`. The `tool()` decorator accepts a name, description, input schema (either simple type mappings or full JSON Schema), and optional `ToolAnnotations` for behavioral hints like `readOnlyHint`. The `list_sessions()` function provides session discovery, and `AgentDefinition` configures [[Subagents]] with custom instructions, tool lists, and optional MCP servers.

## Key Topics

- `query()` function for single-session async iteration
- `ClaudeSDKClient` for persistent multi-turn conversations
- `ClaudeAgentOptions` configuration class with all SDK settings
- Message types: SystemMessage, AssistantMessage, UserMessage, StreamEvent, ResultMessage
- `@tool` decorator for custom [[MCP]] tool definitions
- `create_sdk_mcp_server()` for in-process MCP servers
- `ToolAnnotations` for read-only, destructive, and idempotent hints
- `AgentDefinition` for [[Subagents]] configuration
- `setting_sources` for controlling [[CLAUDE.md File]] and [[Skills]] loading
- `list_sessions()` for session discovery and metadata
- `ResultMessage` subtypes for success, error, and limit handling
