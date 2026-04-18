---
title: "VS Code Extension"
type: entity
tags: [tool, ide]
sources: ["raw/use-claude-code-in-vs-code.md", "raw/platforms-and-integrations.md", "raw/claude-code-overview.md"]
---

# VS Code Extension

The VS Code Extension is a native integration of [[Claude Code]] into Visual Studio Code (version 1.98.0 and later) and the Cursor editor. It provides a dedicated chat panel with inline diff review, @-mention file references, configurable [[Permission Modes]], and multi-tab conversation support, bringing the full capabilities of Claude Code into the editor without requiring a separate terminal window.

The extension includes a built-in IDE [[MCP]] (MCP) server that exposes two tools to Claude: `getDiagnostics` (reads language server errors and warnings from the active workspace) and `executeCode` (runs code in the integrated terminal). These tools allow Claude to see real-time type errors and linter output during coding sessions, significantly improving its ability to iterate on code without manual copy-paste of error messages.

Because the extension connects to the same underlying Claude Code process as the CLI, it shares [[CLAUDE.md File]] project memory, [[Hooks]], [[Skills]], and settings with terminal sessions. Users can switch between the chat panel and the terminal interchangeably. The extension also supports the full range of [[Amazon Bedrock]], [[Google Vertex AI]], and [[Microsoft Foundry]] provider configurations via the same environment variables used by the CLI.
