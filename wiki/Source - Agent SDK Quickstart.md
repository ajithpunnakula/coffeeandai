---
title: "Source - Agent SDK Quickstart"
type: source
date: 2026-04-17
source_file: "raw/quickstart-agent-sdk.md"
tags: [agent-sdk, quickstart, tutorial]
---

The [[Agent SDK]] quickstart guide walks developers through building their first AI agent that autonomously reads code, finds bugs, and fixes them. It targets both Python (3.10+) and TypeScript (Node.js 18+) developers and requires an [[Anthropic]] API key.

The tutorial begins with project setup: installing the SDK (`pip install claude-agent-sdk` or `npm install @anthropic-ai/claude-agent-sdk`), setting the `ANTHROPIC_API_KEY` environment variable, and creating a test file (`utils.py`) with intentional bugs -- a division-by-zero in `calculate_average([])` and a TypeError in `get_user_name(None)`. The agent is then given the prompt to review and fix these bugs.

The guide introduces three core concepts. First, the `query()` function serves as the main entry point, creating an [[Agentic Loop]] that returns an async iterator of messages. Second, the `prompt` parameter tells Claude what to do, and it autonomously selects appropriate tools. Third, the `options` object configures behavior including `allowedTools` (pre-approved tools like Read, Edit, and Glob), `permissionMode` (`acceptEdits` to auto-approve file changes), and `systemPrompt` for custom instructions.

The document details [[Permission Modes]] with a comparison table: `acceptEdits` auto-approves file edits, `dontAsk` denies anything not in the allowed list, `auto` (TypeScript only) uses a model classifier, `bypassPermissions` runs everything without prompts, and `default` requires a `canUseTool` callback. Tool combinations determine what the agent can do -- `Read`, `Glob`, `Grep` for read-only analysis; adding `Edit` for code modification; adding `Bash` for full automation.

A troubleshooting section addresses the `thinking.type.enabled` API error that occurs when using Claude Opus 4.7 with older SDK versions (below v0.2.111), which requires upgrading to support the `thinking.type.adaptive` parameter.

## Key Topics

- Step-by-step setup for Python and TypeScript [[Agent SDK]] projects
- `query()` function as the async iterator entry point
- `allowedTools` for pre-approving specific tools
- [[Permission Modes]] comparison (acceptEdits, dontAsk, auto, bypassPermissions, default)
- Tool combinations for different capability levels
- Bug-fixing agent as a hands-on example
- [[Anthropic]] API key authentication
- Third-party provider support ([[Amazon Bedrock]], [[Google Vertex AI]], Azure)
- Opus 4.7 compatibility requiring SDK v0.2.111+
- [[Extended Thinking]] adaptive parameter changes
