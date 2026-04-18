---
title: "Source - Claude Code Channels Reference"
type: source
date: 2026-04-13
source_file: "raw/channels-reference.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Channels Reference

The [[Claude Code]] Channels Reference is the developer guide for building [[Channels|channel]] [[MCP]] servers that push events into a running [[Claude Code]] session. A channel is an MCP server that declares the `claude/channel` experimental capability and emits `notifications/claude/channel` events. Claude Code spawns the server as a subprocess connected via stdio transport. The only hard dependency is the `@modelcontextprotocol/sdk` package; Bun, Node, and Deno all work as runtimes. During the research preview, custom channels must use `--dangerously-load-development-channels` to bypass the [[Anthropic]]-maintained approved allowlist.

Channels can be one-way (push only — alerts, webhooks, monitoring events) or two-way (with a reply tool that Claude calls to send messages back to the originating platform). The `notifications/claude/channel` event carries a `content` field (the body of the `<channel>` XML tag Claude receives) and an optional `meta` object (each key becomes an XML attribute, e.g., `<channel source="webhook" path="/" method="POST">`). The `instructions` field in the MCP server configuration is injected into Claude's system prompt, telling Claude what events to expect and how to handle them. Up to 8,000 bytes of notification content is supported per event.

Sender gating is a critical security mechanism. An allowlist of approved sender IDs prevents untrusted messages from reaching Claude (prompt injection protection). Chat platform plugins (Telegram, Discord) bootstrap the allowlist via a pairing flow: a user messages the bot, receives a code, and approves it in Claude Code. The allowlist gates both inbound messages and the permission relay capability. The permission relay is an optional opt-in feature where a channel with a trusted sender path can forward Claude's tool approval prompts to the remote channel, allowing the user to approve or deny tool use remotely. This relay is also guarded by the sender allowlist — only allowlisted senders can influence tool permissions.

The reference includes a complete walkthrough for building a webhook receiver: a single-file Bun/TypeScript server that listens on a local HTTP port and forwards every POST body to Claude as a channel event. This demonstrates the three required steps — declaring `claude/channel` capability, connecting via stdio, and emitting notifications.

## Key Topics

- `claude/channel` experimental capability declaration in MCP server configuration
- `notifications/claude/channel` event format: `content` and `meta` fields
- `instructions` field injected into Claude's system prompt
- One-way channels (push/alert) vs two-way channels (with reply tool)
- Stdio transport: Claude Code spawns the channel server as a subprocess
- Sender allowlisting: approved sender IDs gate inbound messages against prompt injection
- Pairing flow for chat platforms (Telegram, Discord) to bootstrap the allowlist
- Permission relay capability: forward tool approval prompts to the remote channel
- Webhook receiver example: local HTTP port → `mcp.notification()` → Claude
- Runtime support: Bun, Node, Deno (MCP SDK required)
- Research preview: `--dangerously-load-development-channels` for local testing
- 8,000-byte content limit per notification event
