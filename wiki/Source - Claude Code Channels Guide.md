---
title: "Source - Claude Code Channels Guide"
type: source
date: 2026-04-13
source_file: "raw/push-events-into-a-running-session-with-channels.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Channels Guide

[[Channels]] is a research preview feature in [[Claude Code]] that allows [[MCP]] servers to push events into a running local session, so Claude can react to things happening outside the terminal. Unlike cloud session spawning or polling, events arrive in the session the user already has open. Channels require Claude Code v2.1.80 or later, claude.ai login (Console and API key authentication not supported), and Bun as the plugin runtime. Team and Enterprise organizations must have [[Channels]] explicitly enabled by an admin before users can activate them.

Three platform channels are included in the research preview as installable plugins: **Telegram** (polls the Telegram Bot API), **Discord** (connects via Discord bot token with Message Content Intent), and **iMessage** (reads the local Messages database via macOS Full Disk Access and sends replies via AppleScript, macOS only, no external service required). All three are installed via `/plugin install <name>@claude-plugins-official` and activated by restarting Claude Code with `--channels plugin:<name>@claude-plugins-official`. A **fakechat** demo channel runs a local chat UI at `http://localhost:8787` with no authentication required, useful for testing the channel plugin flow before connecting a real platform.

Account pairing establishes the sender allowlist for Telegram and Discord: the user messages the bot, receives a pairing code, approves it in Claude Code via `/telegram:access pair <code>` or `/discord:access pair <code>`, then locks down access to their account with the `allowlist` policy. iMessage self-chat bypasses the gate automatically; other contacts are added individually with `/imessage:access allow <handle>`. The sender allowlist also gates the permission relay capability — only allowlisted senders can approve or deny tool use remotely.

Enterprise controls are managed via two settings that users cannot override: `channelsEnabled` (master switch, off by default on Team and Enterprise) and `allowedChannelPlugins` (restricts which plugins can register, replacing the Anthropic default allowlist when set). Pro and Max users skip these checks entirely. [[Remote Control]] is a complementary feature for driving a local session remotely; channels fill the different role of reacting to pushed events from external systems.

## Key Topics

- Research preview: requires Claude Code v2.1.80+, claude.ai login, and Bun
- Supported platforms: Telegram (bot), Discord (bot), iMessage (local database, macOS)
- fakechat demo at localhost:8787 for testing without a real platform
- `--channels plugin:<name>@claude-plugins-official` flag to activate channel plugins
- Pairing flow for Telegram/Discord: message bot → receive code → approve in Claude Code → set allowlist policy
- iMessage: self-chat auto-approved; other contacts added via `/imessage:access allow`
- Sender allowlist gates both inbound messages and permission relay
- Permission relay: allowlisted sender can approve/deny tool use remotely
- Enterprise controls: `channelsEnabled` (master switch) and `allowedChannelPlugins` (plugin whitelist)
- Pro/Max users skip enterprise controls; opt in per session with `--channels`
- Comparison with Remote Control, Claude Code on the web, Slack, MCP, and scheduled tasks
