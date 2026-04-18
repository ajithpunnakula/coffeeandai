---
title: "Computer Use"
type: concept
tags: [features, claude-code]
sources: ["raw/let-claude-use-your-computer-from-the-cli.md", "raw/use-claude-code-desktop.md", "raw/what-s-new.md"]
---

# Computer Use

Computer Use is a research preview feature that enables [[Claude Code]] to control the macOS desktop — clicking, typing, taking screenshots, and interacting with native applications. It extends Claude's reach beyond terminal and file operations to the full GUI environment, enabling automation of workflows that lack APIs or CLI interfaces.

Implemented as a built-in [[MCP]] server (`computer-use`), the feature is available to Pro and Max subscribers on macOS only. It is explicitly not supported when running [[Claude Code]] on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]], where the necessary screen access cannot be granted to a cloud-hosted agent. A machine-wide lock prevents multiple concurrent Computer Use sessions, ensuring only one agent controls the desktop at a time.

Access controls are tiered by application type to limit the blast radius of mistakes or prompt injection. Browsers are view-only (screenshots and reading, no clicking). Terminals and IDEs receive click-only access. Other applications receive full control. The terminal is excluded from screenshots entirely to prevent a malicious webpage or document from injecting instructions via visible terminal text — a specific [[Prompt Injection]] defense. For web-based tasks, [[Claude in Chrome]] is preferred over Computer Use as it provides a more structured and safer browser integration.

Computer Use is also available within the [[Claude Desktop App]] as a separate access path, independent of the CLI. The feature is still in active development and Anthropic recommends caution for production workflows. It pairs naturally with [[Subagents]] — a subagent can be configured with the `computer-use` MCP server and given narrowly scoped instructions, limiting the desktop control surface to only what's needed for a specific task.

## See also

- [[MCP]]
- [[Claude in Chrome]]
- [[Claude Desktop App]]
- [[Amazon Bedrock]]
- [[Google Vertex AI]]
- [[Microsoft Foundry]]
- [[Subagents]]
