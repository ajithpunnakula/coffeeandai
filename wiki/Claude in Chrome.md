---
title: "Claude in Chrome"
type: entity
tags: [tool]
sources: ["raw/use-claude-code-with-chrome-beta.md", "raw/let-claude-use-your-computer-from-the-cli.md"]
---

# Claude in Chrome

Claude in Chrome is a browser extension (requiring v1.0.36 or later) that enables [[Claude Code]] to automate Chrome and Microsoft Edge browsers directly. Unlike the more general [[Computer Use]] capability, which drives a virtual desktop via pixel-level vision, Claude in Chrome operates at a higher level of abstraction: it can open tabs using the user's existing logged-in session state, read the live DOM and console errors, fill forms, and record GIF screencasts of interactions. This makes it significantly faster and more reliable than computer use for web-based tasks.

The extension communicates with the Claude Code CLI via a native messaging host, which acts as a bridge between the browser process and the local Claude session. From Claude's perspective, the browser appears as a set of [[MCP]] (MCP) tools. Because the extension runs inside the user's real browser profile, it can interact with sites that require authentication without any credential sharing — Claude simply acts as the user's agent in their own session.

Claude in Chrome is not available on Brave, Arc, or other Chromium forks. It also does not work in WSL environments (where the browser and the CLI run in different OS contexts) or when Claude Code is routed through third-party cloud providers such as [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]]. For non-Chrome tasks or unsupported environments, [[Computer Use]] via the [[Claude Desktop App]] is the fallback. See [[Source - Claude Code Chrome Integration]] for installation and setup instructions.
