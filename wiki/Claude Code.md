---
title: "Claude Code"
type: entity
tags: [tools, ai-agents, anthropic]
sources: ["raw/claude-code-overview.md", "raw/how-claude-code-works.md", "raw/best-practices-for-claude-code.md", "raw/security.md", "raw/common-workflows.md"]
---

# Claude Code

Anthropic's agentic coding tool. Available in the terminal, IDE extensions, a desktop app, and the browser. Reads your codebase, edits files, runs commands, and integrates with development tools across all surfaces.

## Agentic loop architecture

Claude Code is built around an [[Agentic Loop]] — three repeating phases: **gather context**, **take action**, and **verify results**. The loop is powered by Claude models for reasoning and built-in tools for acting. The tool categories are:

- **File operations**: read, edit, create, rename files
- **Search**: find files by pattern, regex content search
- **Execution**: run shell commands, tests, git operations
- **Web**: fetch documentation, search the web
- **Code intelligence**: type errors, jump-to-definition, find-references (via plugins)

Claude also has tools for spawning [[Subagents]], asking clarifying questions, and orchestration. The loop adapts dynamically — a question may only need context gathering; a bug fix cycles through all phases repeatedly.

Each session is saved as a JSONL file under `~/.claude/projects/`. Sessions are independent: each starts with a fresh context window. Learnings persist via [[CLAUDE.md File]] and [[Auto Memory]].

## Surfaces

Claude Code runs the same underlying engine everywhere. What changes is where the code executes and how you interact with it.

| Surface | Notes |
|---|---|
| **Terminal CLI** | Full feature set; scripting, third-party providers, [[Agent SDK]] access |
| **VS Code** | Inline diffs, @-mentions, plan review, conversation history in editor |
| **JetBrains** | Plugin for IntelliJ, PyCharm, WebStorm; diff viewer, selection sharing |
| **Desktop app** | Visual diff review, parallel sessions, Dispatch, computer use (Pro/Max) |
| **Web** | Runs on Anthropic-managed cloud VMs; continues when you disconnect |
| **Mobile** | Cloud sessions via Claude iOS/Android app; Remote Control for local sessions |

Execution environments: **local** (your machine), **cloud** (Anthropic-managed VMs), and **Remote Control** (your machine, driven from a browser).

## Extension mechanisms

Claude Code is extensible through several orthogonal mechanisms:

- **[[CLAUDE.md File]]**: markdown file read at session start for persistent project-specific instructions, conventions, and architecture decisions
- **[[Skills]]**: `SKILL.md` files in `.claude/skills/` — domain knowledge and reusable workflows invoked with `/skill-name`. Loaded on demand, not at startup.
- **[[Hooks]]**: shell commands that run automatically at specific lifecycle points (before/after file edits, before commits, etc.) — deterministic, not advisory
- **[[MCP]]**: open standard for connecting Claude to external services (databases, Jira, Slack, Figma, Google Drive)
- **[[Subagents]]**: isolated Claude Code sessions with their own context and tool permissions, spawned for focused subtasks without bloating main context
- **[[Plugins]]**: bundles of skills, hooks, subagents, and MCP servers installable from a marketplace
- **[[Agent SDK]]**: Python and TypeScript packages exposing the same agent loop programmatically
- **[[Output Styles]]**: system prompt modifications for adjusting Claude's role, tone, and response format
- **[[Routines]]**: automated tasks triggered by schedule, API, or GitHub events, running in the cloud
- **[[Ultrareview]]**: multi-agent cloud code review with independent bug verification

## Enterprise features

- **Managed settings**: org-wide policies via settings files checked into source control
- **SSO/SAML**: enterprise authentication via Claude's identity layer
- **Audit logging**: OpenTelemetry metrics for monitoring and compliance
- **Hooks for governance**: `ConfigChange` hooks allow auditing or blocking settings changes during sessions
- **Sandboxing**: OS-level filesystem and network isolation for bash commands
- **Bedrock, Vertex, Foundry**: deployable via cloud provider APIs — see [[Source - Claude Code on Amazon Bedrock|Claude Code on Amazon Bedrock]], [[Source - Claude Code on Google Vertex AI|Claude Code on Google Vertex AI]], [[Source - Claude Code on Microsoft Foundry|Claude Code on Microsoft Foundry]]

## Security model

Claude Code uses a permission-based architecture. Read-only by default; file writes and shell commands require explicit approval. Key protections:

- **Write scope restriction**: can only write to the directory where it was started and subdirectories
- **Prompt injection mitigations**: context-aware analysis, input sanitization, command blocklist (`curl`, `wget` blocked by default), isolated context windows for web fetch
- **Permission modes**: Default (asks for everything), Accept Edits (auto-approves file writes), Plan Mode (read-only), Auto Mode (background classifier approves routine actions)
- **Allowlists**: per-user, per-project, per-org allowlists for frequently used safe commands
- **[[Checkpointing]]**: file state snapshots before every edit; press Esc+Esc to rewind
- **Trust verification**: new codebases and MCP servers require explicit trust before running
- **Secure credential storage**: API keys encrypted; cloud sessions use scoped short-lived credentials

SOC 2 Type 2 and ISO 27001 certified. Details at Anthropic Trust Center.

