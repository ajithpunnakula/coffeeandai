---
title: "Source - Claude Code Remote Control"
type: source
date: 2026-04-13
source_file: "raw/continue-local-sessions-from-any-device-with-remote-control.md"
tags: [claude-code, features]
---

# Source - Claude Code Remote Control

[[Remote Control]] connects [claude.ai/code](https://claude.ai/code) or the Claude mobile app (iOS and Android) to a [[Claude Code]] session running on the user's local machine. Execution stays entirely local — the filesystem, [[MCP]] servers, tools, and project configuration all remain on the machine. The web and mobile interfaces serve as a window into the local session, not a replacement for it. This is the key distinction from [[Source - Claude Code on the Web|Claude Code on the web]], which runs in [[Anthropic]]-managed cloud infrastructure. Remote Control requires Claude Code v2.1.51 or later, a Pro, Max, Team, or Enterprise subscription (API keys not supported), and claude.ai authentication. On Team and Enterprise plans, an admin must enable the Remote Control toggle in Claude Code admin settings.

There are three CLI invocation modes. **Server mode** (`claude remote-control`) keeps a process running in the terminal waiting for remote connections, with flags for `--name`, `--spawn` (same-dir / worktree / session), `--capacity` (default 32 concurrent sessions), `--verbose`, and `--sandbox`. The `--spawn worktree` mode gives each on-demand session its own [[Git Worktrees|Git worktree]]. **Interactive session mode** (`claude --remote-control`) opens a normal interactive session that is simultaneously available for remote access. **From an existing session** (`/remote-control` or `/rc`), the current conversation history carries over. A VS Code extension command is also available. A QR code can be displayed (press spacebar in server mode, or it appears automatically in `/remote-control`) for quick mobile connection.

The connection mechanism uses outbound-only HTTPS — the local process never opens inbound ports. Claude Code makes outbound HTTPS requests to the [[Anthropic]] API and polls for work. Multiple short-lived credentials are used, each scoped to a single purpose and expiring independently. Traffic travels over TLS. The conversation stays in sync across all connected devices (terminal, browser, phone) so messages can be sent interchangeably from any surface. Sessions reconnect automatically after network interruptions or laptop sleep, though an outage longer than roughly 10 minutes causes a timeout and the process exits.

[[Ultraplan]] conflicts with Remote Control: both features occupy the claude.ai/code interface, so starting Ultraplan disconnects any active Remote Control session. Other limitations include one remote session per interactive process (server mode removes this restriction), and the local process must remain running for the session to stay active. A `--remote-control` setting in `/config` can enable Remote Control automatically for every interactive session.

## Key Topics

- Connects claude.ai/code or Claude mobile app to local CLI session
- Execution stays local: filesystem, MCP servers, tools, project config all local
- Requires Pro/Max/Team/Enterprise; API keys not supported; Team/Enterprise requires admin toggle
- Server mode (`claude remote-control`): `--spawn` modes (same-dir, worktree, session), `--capacity`
- Interactive mode (`claude --remote-control`): normal session + remote access
- `/remote-control` or `/rc` from existing session (carries over conversation history)
- VS Code extension support
- QR code for mobile connection (spacebar in server mode)
- Outbound-only HTTPS relay: no inbound ports; Anthropic API as relay
- Multi-device sync: terminal, browser, and phone interchangeable
- Auto-reconnect after network interruptions; ~10-minute outage causes timeout
- Conflict with Ultraplan: both use claude.ai/code interface, only one active at a time
- `/config` setting to enable Remote Control for all interactive sessions automatically
