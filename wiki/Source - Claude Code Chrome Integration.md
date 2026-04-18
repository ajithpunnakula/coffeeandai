---
title: "Source - Claude Code Chrome Integration"
type: source
date: 2026-04-13
source_file: "raw/use-claude-code-with-chrome-beta.md"
tags: [claude-code, ide-integration]
---

# Source - Claude Code Chrome Integration

[[Claude Code]] integrates with the [[Claude in Chrome]] browser extension (beta) to provide browser automation from the CLI or the [[VS Code Extension]] extension. The integration requires the Claude in Chrome extension version 1.0.36 or higher and Claude Code v2.0.73+, and is limited to direct [[Anthropic]] plans (Pro, Max, Team, Enterprise) — it is not available through [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]]. Browser support covers Google Chrome and Microsoft Edge only; Brave, Arc, other Chromium browsers, and WSL are not supported.

Claude opens new browser tabs to perform tasks and inherits the user's existing login sessions, so it can interact with authenticated web apps (Google Docs, Gmail, Notion, Sheets, and others) without API connectors. All browser actions run in a visible Chrome window in real time. Claude pauses and asks for manual intervention when it encounters login pages or CAPTCHAs. Capabilities include: live debugging (reading console errors and DOM state), design verification against Figma mocks, web app testing (form validation, visual regressions, user flows), data extraction from web pages (saved as structured files), task automation (form filling, multi-site workflows), and session recording as GIFs.

Chrome integration is enabled either via the `--chrome` CLI flag or by running `/chrome` within a session. The `/chrome` command also allows setting Chrome as always-on, checking connection status, managing site permissions, and reconnecting the extension. In the [[VS Code Extension]] extension, Chrome is available whenever the extension is installed without a flag. Site-level permissions are managed through the Chrome extension settings. The integration uses a native messaging host (installed at first Chrome enable) that communicates between Claude Code and the extension; the first use requires restarting Chrome to pick up the new host configuration.

Common troubleshooting issues include: extension not detected (verify installation, restart Chrome and Claude Code, run `/chrome` to reconnect), browser not responding due to JavaScript modal dialogs blocking events, and connection drops during long sessions when the Chrome extension's service worker goes idle (reconnect via `/chrome`).

## Key Topics

- Beta feature: Chrome and Edge only; not supported on Brave, Arc, WSL, or third-party providers
- Requires Claude in Chrome extension v1.0.36+, Claude Code v2.0.73+, direct Anthropic plan
- Inherits user's browser login state; accesses authenticated apps without API connectors
- Capabilities: console/DOM debugging, design verification, form testing, data extraction, GIF recording
- CLI: `--chrome` flag or `/chrome` command; VS Code extension: automatic when extension installed
- `/chrome` command: enable by default, check status, manage permissions, reconnect
- Native messaging host installed on first use; Chrome restart required
- Site permissions managed through Chrome extension settings
- Troubleshooting: JS modal dialogs block browser events; service worker idle drops connection
- Windows-specific: named pipe conflicts (EADDRINUSE), native messaging host crashes
