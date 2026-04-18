---
title: "Channels"
type: concept
tags: [extensions, claude-code]
sources: ["raw/push-events-into-a-running-session-with-channels.md", "raw/channels-reference.md", "raw/extend-claude-code.md"]
---

# Channels

Channels are a push-based event delivery system built on [[MCP]] that injects external messages into a running [[Claude Code]] session. They allow events originating from Telegram, Discord, iMessage, webhooks, or any other external source to appear in Claude's context in real time — enabling reactive workflows without polling or manual copy-paste.

Channel servers declare a `claude/channel` capability in their [[MCP]] server manifest and emit `notifications/claude/channel` events when new messages arrive. [[Claude Code]] listens for these notifications and delivers them into the active session. Two variants exist: **one-way channels** forward incoming events only (Claude sees the messages but cannot reply through the channel), while **two-way channels** also expose reply tools so Claude can respond back to the originating platform. This makes two-way channels suitable for building conversational integrations — for example, a Telegram bot that delegates to a Claude session.

Security is a first-class concern given that channels introduce untrusted external content into Claude's context. **Sender allowlisting** restricts which external identities can inject messages, providing a defense against [[Prompt Injection]] via crafted channel messages. For workflows where Claude needs elevated permissions to act on channel messages, **permission relay** forwards tool approval prompts back to the remote sender, so the channel user can approve or deny actions interactively. Sessions are activated with the `--channels` flag at startup.

Enterprise administrators control channels via managed settings: `channelsEnabled` toggles the feature globally, and `allowedChannelPlugins` restricts which channel [[Plugins]] may be installed. Channels are distributed as plugins, meaning they benefit from the full [[Plugins]] installation and update lifecycle. The [[Source - Claude Code Channels Guide]] and [[Source - Claude Code Channels Reference]] provide detailed configuration guidance.

## See also

- [[MCP]]
- [[Plugins]]
- [[Claude Code]]
- [[Permission Modes]]
