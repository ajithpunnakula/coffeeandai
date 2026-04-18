---
title: "Source - Claude Code Sandboxing"
type: source
date: 2026-04-13
source_file: "raw/sandboxing.md"
tags: [claude-code, security]
---

# Source - Claude Code Sandboxing

[[Claude Code]] includes a native sandboxing capability that uses OS-level primitives to enforce filesystem and network isolation for Bash subprocess execution. This reduces the permission-prompt fatigue of per-command approvals by defining upfront boundaries within which [[Claude Code]] can work autonomously. On **macOS**, sandboxing is built in and uses Apple's Seatbelt framework. On **Linux and WSL2**, it uses [bubblewrap](https://github.com/containers/bubblewrap) and requires the `bubblewrap` and `socat` packages. **WSL1 is not supported** because bubblewrap requires kernel features only available in WSL2. Docker is incompatible with sandboxing by default (the weaker nested sandbox mode is available but considerably weakens security).

Filesystem isolation restricts Bash subprocesses to read/write within the current working directory and its subdirectories by default, while allowing read access to the broader system (excluding explicitly denied paths). Additional write paths can be granted via `sandbox.filesystem.allowWrite`; paths can be denied via `denyWrite` and `denyRead`; specific paths can be re-allowed within a denied region via `allowRead`. All sandbox filesystem path arrays **merge** across settings scopes (they are not replaced), so users and projects can extend managed paths without overriding them. Network isolation runs through an external proxy that restricts outbound connections to approved domains; new domains trigger permission prompts (or are auto-blocked if `allowManagedDomainsOnly` is enabled).

Two sandbox modes are available: **auto-allow mode** (sandboxed commands run automatically without permission prompts, while commands needing out-of-sandbox network access fall back to the regular permission flow) and **regular permissions mode** (all Bash commands still go through the standard permission flow even when sandboxed). An intentional escape hatch exists: if a command fails due to sandbox restrictions, [[Claude Code]] may retry it with the `dangerouslyDisableSandbox` parameter, sending it through the normal permission flow. This can be disabled by setting `allowUnsandboxedCommands: false`. Setting `sandbox.failIfUnavailable: true` makes a missing sandbox a hard failure rather than a graceful degradation—useful for managed deployments requiring sandboxing as a security gate.

Sandboxing provides defense against [[Prompt Injection]] and other supply-chain attacks: even if Claude's decision-making is manipulated, OS-level enforcement prevents exfiltration, prevents modification of system files and shell configs, and blocks access to unauthorized domains. Key security limitations: network filtering only restricts domain access (does not inspect traffic content), broad domains like `github.com` in the allowlist could enable data exfiltration, `allowUnixSockets` can inadvertently grant access to powerful system services (e.g., Docker socket), and overly broad `allowWrite` paths can enable privilege escalation. The sandbox runtime is published as an open-source npm package (`@anthropic-ai/sandbox-runtime`) for use in other agent projects.

## Key Topics

- OS-level enforcement: Seatbelt (macOS), bubblewrap (Linux/WSL2); WSL1 not supported
- Filesystem isolation: default write scope (working directory), configurable `allowWrite`/`denyWrite`/`denyRead`/`allowRead`
- Path array merging across settings scopes (not replacement)
- Network isolation via external proxy: domain allowlist, per-domain permission prompts
- `allowManagedDomainsOnly` for auto-blocking non-approved domains
- Two sandbox modes: auto-allow (no prompts for sandboxed commands) vs. regular permissions
- `dangerouslyDisableSandbox` escape hatch; `allowUnsandboxedCommands: false` to disable it
- `sandbox.failIfUnavailable: true` for hard failure in managed deployments
- Security benefits: prompt injection protection, exfiltration prevention, supply-chain attack mitigation
- Security limitations: no traffic inspection, domain fronting bypass risk, Unix socket risk
- Docker incompatibility; `enableWeakerNestedSandbox` for Docker (weakens security)
- Sandbox vs. [[Permission Modes|permissions]]: complementary layers (permissions gate tools; sandbox gates what tools can access)
- Open-source sandbox runtime: `@anthropic-ai/sandbox-runtime` npm package
