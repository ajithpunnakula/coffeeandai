---
title: "Source - Agent SDK Overview"
type: source
date: 2026-04-17
source_file: "raw/agent-sdk-overview.md"
tags: [agent-sdk, sdk, tools, api]
---

The [[Agent SDK]] overview introduces [[Anthropic]]'s library for building production AI agents using [[Claude Code]] as a foundation. Formerly known as the Claude Code SDK, the package has been renamed to the Claude Agent SDK to reflect its broader applicability beyond coding tasks. It is available in both Python (`claude-agent-sdk`) and TypeScript (`@anthropic-ai/claude-agent-sdk`).

The SDK's core value proposition is that it provides built-in tool execution. Unlike the Anthropic Client SDK (which requires developers to implement their own tool loop), the Agent SDK handles tool orchestration autonomously. The main entry point is the `query()` function, which returns an async iterator streaming messages as the agent works through a task. Developers supply a prompt and configuration options, and the SDK manages the [[Agentic Loop]] internally.

Built-in tools include Read, Write, Edit, Bash, Monitor, Glob, Grep, WebSearch, WebFetch, and AskUserQuestion. These mirror the same tools that power the [[Claude Code]] CLI, enabling agents to read files, run terminal commands, search codebases, and fetch web content out of the box. The SDK also supports [[Hooks]] (callbacks at key lifecycle points like PreToolUse, PostToolUse, and Stop), [[Subagents]] (specialized child agents for focused subtasks), and [[MCP]] integration for connecting to external systems like databases and browsers.

[[Permission Modes]] let developers control tool access at varying levels of trust. Options include `default` (manual approval), `acceptEdits` (auto-approve file edits), `dontAsk` (deny anything not pre-approved), `auto` (model-classified approvals, TypeScript only), and `bypassPermissions` (fully trusted environments). Sessions can be captured and resumed, allowing multi-turn conversations with full context preservation.

The SDK also loads [[Claude Code]] filesystem-based configuration by default, including [[Skills]] (specialized markdown-defined capabilities), slash commands, [[CLAUDE.md File]] project instructions, and [[Plugins]]. Authentication supports Anthropic API keys directly, or third-party providers like [[Amazon Bedrock]], [[Google Vertex AI]], and Microsoft Azure. Branding guidelines specify that partners may use "Claude Agent" but not "Claude Code" in their product naming.

## Key Topics

- [[Agent SDK]] as a renamed, production-ready library for building AI agents
- Built-in tools (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch)
- `query()` function as the primary entry point with async iterator pattern
- [[Hooks]] for intercepting agent lifecycle events
- [[Subagents]] for delegating focused subtasks
- [[MCP]] integration for external services
- [[Permission Modes]] (default, acceptEdits, dontAsk, auto, bypassPermissions)
- Session management with resume and fork capabilities
- [[CLAUDE.md File]], [[Skills]], and [[Plugins]] support
- Python and TypeScript SDK availability
- Third-party authentication via [[Amazon Bedrock]], [[Google Vertex AI]], and Azure
