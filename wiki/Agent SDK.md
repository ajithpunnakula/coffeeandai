---
title: "Agent SDK"
type: entity
tags: [tools, ai-agents, anthropic]
sources: ["raw/run-claude-code-programmatically.md", "raw/platforms-and-integrations.md", "raw/agent-sdk-overview.md", "raw/agent-sdk-reference-python.md", "raw/agent-sdk-reference-typescript.md", "raw/quickstart-agent-sdk.md", "raw/hosting-the-agent-sdk.md", "raw/how-the-agent-loop-works.md", "raw/migrate-to-claude-agent-sdk.md", "raw/modifying-system-prompts.md", "raw/configure-permissions-agent-sdk.md", "raw/stream-responses-in-real-time.md", "raw/typescript-sdk-v2-interface-preview.md", "raw/use-claude-code-features-in-the-sdk.md", "raw/get-structured-output-from-agents.md", "raw/agent-skills-in-the-sdk.md", "raw/plugins-in-the-sdk.md", "raw/slash-commands-in-the-sdk.md", "raw/subagents-in-the-sdk.md", "raw/connect-to-external-tools-with-mcp.md", "raw/give-claude-custom-tools.md", "raw/handle-approvals-and-user-input.md", "raw/intercept-and-control-agent-behavior-with-hooks.md", "raw/scale-to-many-tools-with-tool-search.md", "raw/constrain-plugin-dependency-versions.md", "raw/observability-with-opentelemetry.md", "raw/securely-deploying-ai-agents.md", "raw/track-cost-and-usage.md", "raw/streaming-input.md", "raw/todo-lists.md", "raw/work-with-sessions.md", "raw/rewind-file-changes-with-checkpointing.md"]
---

# Agent SDK

[[Anthropic]]'s SDK that exposes the same [[Agentic Loop]], tools, and context management that power [[Claude Code]] — available as a CLI mode (`claude -p`) and as Python (`claude-agent-sdk`) and TypeScript (`@anthropic-ai/claude-agent-sdk`) packages for programmatic control.

## CLI surface: the `-p` flag

The primary CLI surface is `claude -p "prompt"`, which runs Claude non-interactively. All standard CLI options work with `-p`:

- `--continue` / `--resume <session_id>`: continue a previous conversation
- `--allowedTools "Read,Edit,Bash"`: auto-approve specific tools without prompting
- `--permission-mode acceptEdits|dontAsk|auto`: set a baseline [[Permission Modes|permission mode]]
- `--output-format text|json|stream-json`: control output structure
- `--json-schema '<JSON Schema>'`: enforce a specific output schema ([[Structured Output]])
- `--append-system-prompt` / `--system-prompt`: modify or replace the default system prompt

`--bare` reduces startup time by skipping auto-discovery of [[Hooks]], [[Skills]], [[Plugins]], [[MCP]] servers, [[Auto Memory]], and [[CLAUDE.md File]]. Recommended for CI and scripts. Authentication must come from `ANTHROPIC_API_KEY` or an `apiKeyHelper`.

## Python and TypeScript packages

Full SDK packages provide: the `query()` function for single-turn or multi-turn conversations, `ClaudeSDKClient` (Python) / `startup()` (TypeScript) for advanced session management, [[Structured Output]] with Pydantic/Zod validation, real-time streaming via `StreamEvent` callbacks, tool approval via `canUseTool` callbacks, and complete control over orchestration, tool access, and [[Permission Modes]].

The TypeScript SDK has a V2 interface preview with simplified `send()`/`stream()` patterns and automatic session management. Migration from the older Claude Code SDK involves replacing `@anthropic-ai/claude-code-sdk` with `@anthropic-ai/claude-agent-sdk` — the `query()` function signature is largely unchanged but message types have new fields.

## Core capabilities

The SDK exposes the same features available in interactive [[Claude Code]]:

- **[[Agentic Loop]]**: the gather-act-verify cycle with configurable max turns, effort levels, and [[Extended Thinking]]
- **Session management**: continue, resume, and fork sessions across invocations; cross-host session portability
- **[[Structured Output]]**: JSON Schema-validated responses with Zod (TypeScript) or Pydantic (Python) integration
- **Streaming**: real-time token delivery with `StreamEvent` types for assistant text, tool use, results, and progress
- **[[Hooks]]**: lifecycle event interception for tool calls, permissions, compaction, and custom enforcement
- **[[Skills]]**, [[Plugins]], [[Subagents]], [[MCP]]: all loadable from filesystem or configured programmatically
- **[[Checkpointing]]**: automatic file state snapshots with UUID-based rewind
- **[[Permission Modes]]**: full six-mode permission system with allow/deny rules
- **[[Tool Search]]**: dynamic tool discovery for managing hundreds of tools without consuming context
- **[[OpenTelemetry]] observability**: traces, metrics, and events exported to any OTLP backend
- **Cost tracking**: per-model token usage, deduplication, and [[Prompt Caching]] integration via `track_cost_and_usage`
- **Todo lists**: built-in `TodoWrite` tool for task tracking with progress display

## Hosting patterns

Four deployment architectures are documented: **ephemeral** (serverless, one agent per request), **long-running** (persistent sessions with WebSocket connections), **hybrid** (short-lived containers with session state stored externally), and **single container** (all-in-one for development). Sandbox providers include Modal, Cloudflare, E2B, Fly Machines, Vercel, and Daytona. Production deployments require network access to the Anthropic API and any configured [[MCP]] servers.

## Security

The SDK inherits [[Claude Code]]'s layered security model: [[Permission Modes]] for approval control, [[Sandboxing]] for OS-level isolation, [[Hooks]] for policy enforcement, and the proxy pattern (placing an HTTP proxy between the agent and external services) for credential management and network control in multi-tenant deployments.

## See also

- [[Claude Code]], [[Agentic Loop]], [[Structured Output]], [[Tool Search]]
- [[Source - Agent SDK Overview]], [[Source - Agent SDK Quickstart]]
