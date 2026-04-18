---
title: "Prompt Injection"
type: concept
tags: [security]
sources: ["raw/claude-code-security.md", "raw/claude-code-sandboxing.md", "raw/claude-code-development-containers.md", "raw/claude-code-computer-use.md"]
---

# Prompt Injection

Prompt injection is a security attack where untrusted content (file contents, tool outputs, web pages) attempts to override an LLM's instructions, causing it to perform unintended actions.

## Relevance to Claude Code

[[Claude Code]] faces prompt injection risk whenever it reads untrusted content — repository files, command output, [[MCP]] tool responses, or web pages. [[Anthropic]]'s [[Source - Claude Code Security|security architecture]] addresses this through multiple layers:

- **[[Permission Modes]]** — require user approval before destructive actions, limiting what injected prompts can accomplish even if they influence the model
- **[[Sandboxing]]** — OS-level Seatbelt (macOS) and bubblewrap (Linux) isolation restricts file system and network access for Bash subprocesses
- **[[Source - Claude Code Development Containers|Development containers]]** — reference devcontainer with firewall rules to isolate untrusted code
- **[[Computer Use]]** — desktop control carries elevated prompt injection risk since the model interacts with arbitrary screen content

## Mitigation strategies

1. **Least privilege** — run in default or `acceptEdits` permission mode rather than `auto` or `bypass`
2. **Sandbox untrusted repos** — use development containers or restricted network environments
3. **Review tool outputs** — inspect results from external tools before allowing Claude to act on them
4. **[[Channels]]** — channel inputs are treated as untrusted; Claude applies scrutiny to messages from external services
