---
title: "Source - Claude Code Computer Use"
type: source
date: 2026-04-13
source_file: "raw/let-claude-use-your-computer-from-the-cli.md"
tags: [claude-code, features]
---

# Source - Claude Code Computer Use

[[Claude Code]] includes a built-in [[MCP]] server called `computer-use` that enables macOS desktop control from the CLI. With it, Claude can take screenshots, click, type, scroll, and interact with native applications — all from the same terminal session where it writes and edits code. This is a research preview available only on Pro and Max plans (not Team or Enterprise), requires Claude Code v2.1.85 or later, macOS only (not Linux or Windows in CLI mode), and an interactive session (the `-p` flag is not supported). It is also not available with [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]] — it requires direct claude.ai authentication.

The `computer-use` server is off by default and must be enabled once per project via `/mcp`. The first activation triggers macOS permission prompts for Accessibility (clicking, typing, scrolling) and Screen Recording (seeing the screen). Claude prioritizes more precise tools first: [[MCP]] servers for a service, then Bash for shell commands, then [[Claude in Chrome]] for browser work, and only falls back to computer use for native apps and GUI-only tools that have no API. When Claude starts controlling the screen, other visible apps are hidden so Claude interacts only with approved apps. The terminal window is always excluded from screenshots, preventing Claude from seeing its own output or being influenced by on-screen prompts in the terminal.

Per-session app approval is required the first time Claude needs each application. A prompt shows which apps will be controlled, any extra permissions (e.g., clipboard access), and a warning for high-risk apps. Control tiers vary by app category: browsers and trading platforms are view-only, terminals and IDEs are click-only, and all other apps get full control. A machine-wide lock prevents concurrent computer use sessions — only one Claude Code session can hold the lock at a time. The Esc key aborts computer use from anywhere and releases the lock. Screenshots from Retina displays are automatically downscaled (e.g., 3456×2234 → ~1372×887) before being sent to the model.

Safety guardrails include per-app approval, sentinel warnings for high-privilege apps (shell access, filesystem, system settings), terminal exclusion from screenshots, a global Esc escape that cannot be intercepted by prompt injection, and the machine-wide lock. Users should review the computer use safety guide for best practices, as computer use runs on the actual desktop unlike the sandboxed Bash tool.

## Key Topics

- Built-in `computer-use` MCP server for macOS desktop control from CLI
- Research preview: Pro and Max plans only, macOS only, interactive sessions only
- Not available with Amazon Bedrock, Google Vertex AI, or Microsoft Foundry
- Enable once per project via `/mcp`; requires macOS Accessibility and Screen Recording permissions
- Tool priority: MCP server → Bash → Claude in Chrome → computer use (broadest, slowest)
- Per-session app approval with control tiers: view-only (browsers), click-only (terminals/IDEs), full (others)
- Apps hidden during Claude's turn; terminal excluded from screenshots
- Machine-wide lock prevents concurrent sessions; Esc key aborts and releases
- Automatic screenshot downscaling for Retina displays
- Prompt injection protection: terminal excluded from screenshots, Esc consumes key press
- Differences from Desktop app: CLI is macOS only, no denied apps list, no auto-unhide toggle
