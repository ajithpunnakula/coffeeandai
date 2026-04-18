---
title: "Source - Claude Code Security"
type: source
date: 2026-04-13
source_file: "raw/security.md"
tags: [claude-code, security]
---

# Source - Claude Code Security

[[Claude Code]]'s security model is built on a layered architecture starting from read-only by default. Additional capabilities (file writes, shell commands, [[MCP]] tool calls) require explicit user approval. Three built-in protections reduce permission fatigue without sacrificing control: [[Sandboxing]] (OS-level filesystem and network isolation for bash commands, enabled via `/sandbox`), write access restriction (Claude can only write within the directory it was started in — not parent directories), and permission allowlists (per-user, per-codebase, or per-organization trusted command lists). The security program is backed by SOC 2 Type 2 and ISO 27001 certifications, accessible via the Anthropic Trust Center.

Prompt injection mitigation is a distinct security layer. Prompt injection attacks attempt to override AI instructions via malicious text embedded in files, web content, or tool outputs. [[Claude Code]]'s defenses include: the permission system (sensitive operations always require explicit approval even if injection attempts to skip it), context-aware analysis (detecting harmful instructions by analyzing the full request), input sanitization (preventing command injection), and a command blocklist (blocking `curl`, `wget`, and similar tools that can fetch arbitrary web content by default). Additional protections: network requests require user approval, web fetch uses an isolated context window (preventing injected prompts from reaching the main context), and suspicious bash commands require manual approval even if previously allowlisted.

Cloud execution adds a separate security perimeter. Each cloud session runs in an isolated Anthropic-managed VM with configurable (default-limited) network access. GitHub authentication is handled through a scoped credential proxy — the actual GitHub token never enters the sandbox. Git push is restricted to the current working branch. All cloud operations are audit-logged and environments are automatically cleaned up after session completion. Remote Control sessions (web UI controlling a local machine) follow local data flows with multiple short-lived, narrowly scoped credentials that expire independently to limit blast radius.

[[MCP]] security and [[VS Code Extension|IDE]] security are addressed separately. For MCP, [[Claude Code]] allows user-configured MCP servers whose permissions can be set in Claude Code settings. [[Anthropic]] does not manage or audit third-party MCP servers — users are responsible for trusting the servers they configure. For IDE security, the VS Code extension has its own security and privacy documentation. Security best practices for teams include managed settings to enforce org standards, OpenTelemetry monitoring, and `ConfigChange` hooks to audit or block settings modifications during sessions.

## Key Topics

- [[Permission Modes]]: read-only default, explicit approval for writes/commands
- [[Sandboxing]]: OS-level filesystem and network isolation via `/sandbox`
- Write access restriction: confined to working directory and subdirectories
- Permission allowlists: per-user, per-codebase, per-organization scopes
- Prompt injection mitigations: permission system, context-aware analysis, input sanitization, command blocklist
- `curl`/`wget` blocked by default; web fetch uses isolated context window
- Trust verification for first-time codebases and new [[MCP]] servers
- Cloud execution security: isolated VMs, scoped GitHub credential proxy, branch restrictions, audit logging
- Remote Control credentials: multiple short-lived narrowly-scoped tokens
- [[MCP]] security: user-configured, Anthropic does not audit third-party servers
- Team security: managed settings, OpenTelemetry monitoring, `ConfigChange` [[Hooks]]
- Certifications: SOC 2 Type 2, ISO 27001 (Anthropic Trust Center)
- Reporting vulnerabilities via HackerOne program
