---
title: "Remote Control"
type: concept
tags: [features, claude-code]
sources: ["raw/continue-local-sessions-from-any-device-with-remote-control.md", "raw/platforms-and-integrations.md"]
---

# Remote Control

Remote Control connects claude.ai/code or the Claude mobile app to a [[Claude Code]] session running on a local machine, allowing the user to continue or monitor work from any device. The key architectural principle is that **execution stays entirely local** — local files, [[MCP]] servers, project configuration, and installed [[Plugins]] all remain on the developer's machine. The web or mobile interface acts purely as a remote window into the terminal session.

Invoked via `claude remote-control`, the server accepts multiple concurrent connections and supports three `--spawn` modes governing how connections are handled. **same-dir** mode gives all remote connections access to the same working directory (suitable for simple monitoring). **worktree** mode creates an isolated [[Git Worktrees|git worktree]] for each connection, preventing remote sessions from interfering with local work. **session** mode limits connections to a single active session. Mobile pairing is streamlined via a QR code generated at connection start.

The networking model is outbound-only: [[Claude Code]] opens an HTTPS relay connection to Anthropic's infrastructure rather than listening on an inbound port. This means no firewall rules, no port forwarding, and no VPN requirements — the local machine initiates the connection and the relay broker routes traffic. The trade-off is a dependency on Anthropic's relay service for connectivity. One notable conflict: Remote Control and [[Ultraplan]] both occupy the claude.ai/code interface and cannot be active simultaneously.

Remote Control is particularly useful for long-running autonomous tasks initiated at a desk that a developer wants to check on from a phone or tablet. Combined with [[Subagents]] running in background mode and [[Hooks]] for completion notifications, it enables a workflow where Claude works unattended and the developer is notified and can intervene remotely when needed.

## See also

- [[Claude Code]]
- [[Git Worktrees]]
- [[Plugins]]
- [[Subagents]]
- [[Hooks]]
- [[Ultraplan]]
