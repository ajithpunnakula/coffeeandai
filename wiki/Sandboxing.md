---
title: "Sandboxing"
type: concept
tags: [security, claude-code]
sources: ["raw/sandboxing.md", "raw/security.md", "raw/configure-permissions.md", "raw/securely-deploying-ai-agents.md"]
---

# Sandboxing

Sandboxing provides OS-level isolation for the Bash subprocess that [[Claude Code]] uses to execute shell commands, restricting what the subprocess and all its children can do to the filesystem and network. It is distinct from [[Permission Modes]], which govern whether Claude asks for approval — sandboxing enforces limits even after approval is granted, acting as a second line of defense.

The implementation uses **Seatbelt** on macOS and **bubblewrap** on Linux and WSL2 (WSL1 is not supported). Critically, the restrictions apply to all child processes, not just Claude's direct tool calls — so tools like `kubectl`, `terraform`, `npm`, and `git` invoked inside a sandboxed Bash session are also constrained. This prevents supply-chain or prompt-injection attacks where a malicious script attempts to exfiltrate data or make unauthorized network calls. The sandbox is open-sourced as the `@anthropic-ai/sandbox-runtime` package.

Two operational modes exist within sandboxing. In **auto-allow** mode, sandboxed commands run without per-command approval prompts (Claude trusts that the sandbox boundary is enforcement enough). In regular mode, the sandbox adds protection but per-command approval still applies. Configuration is done via `sandbox.*` settings: `filesystem.allowWrite` and `filesystem.denyWrite` control path-level write access, while `network.allowedDomains` limits outbound connections to an explicit allowlist.

For environments where sandboxing is incompatible — most notably Docker containers, where nested namespace creation is blocked — it can be disabled via the `dangerouslyDisableSandbox` flag. Administrators can prevent this escape hatch by setting `allowUnsandboxedCommands: false` in managed settings. Sandboxing works in concert with [[Permission Modes]] and [[Hooks]] to provide defense-in-depth, particularly protecting against [[Prompt Injection]] scenarios where Claude's reasoning is compromised by malicious content in the environment.

## See also

- [[Permission Modes]]
- [[Hooks]]
- [[Claude Code]]
