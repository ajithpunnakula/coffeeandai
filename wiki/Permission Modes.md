---
title: "Permission Modes"
type: concept
tags: [security, claude-code]
sources: ["raw/choose-a-permission-mode.md", "raw/configure-permissions.md", "raw/security.md", "raw/configure-permissions-agent-sdk.md"]
---

# Permission Modes

Permission modes control the level of autonomy [[Claude Code]] exercises when taking actions — determining whether it asks for approval, acts automatically, or refuses to act at all. Choosing the right mode is a key part of balancing productivity with safety, and the correct choice depends heavily on the trust level of the execution environment.

[[Claude Code]] offers six modes. **Default** mode asks for approval before each tool use; it is the safest option for interactive development. **acceptEdits** automatically approves file edits and common filesystem commands, reducing interruption while retaining approval for shell execution. **plan** is read-only: Claude can explore and reason but cannot modify anything, useful for auditing or planning sessions. **auto** is a research preview where a classifier model evaluates each action before executing it, approximating safety without requiring human approval. **dontAsk** auto-denies any tool not explicitly pre-approved — designed for CI pipelines where no human is present to respond. **bypassPermissions** skips all permission prompts and is intended only for fully isolated VMs or containers where the environment itself is the safety boundary.

Permission rules within each mode use a precedence of deny > ask > allow and are expressed with `Tool(specifier)` syntax in settings. This allows fine-grained overrides: for example, always denying `Bash(rm -rf *)` while allowing `Bash(npm test)` in auto mode. Certain **protected paths** — including `.git`, `.vscode`, `.claude`, and shell configuration files — are never auto-approved regardless of mode, providing a hard floor of safety.

Modes can be switched in several ways: via Shift+Tab in the CLI, through settings in the [[VS Code Extension]] or [[JetBrains Plugin]], via the [[Claude Desktop App]], or from the web interface. For enterprise deployments, mode floors can be enforced via managed settings. Permission modes complement [[Sandboxing]] (OS-level process isolation) and [[Hooks]] (event-driven policy enforcement) to form a layered defense-in-depth security model.

## See also

- [[Sandboxing]]
- [[Hooks]]
- [[Claude Code]]
- [[VS Code Extension]]
- [[JetBrains Plugin]]
