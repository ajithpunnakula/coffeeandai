---
title: "Source - Claude Code Development Containers"
type: source
date: 2026-04-13
source_file: "raw/development-containers.md"
tags: [claude-code, security, configuration]
---

# Source - Claude Code Development Containers

[[Anthropic]] publishes a reference devcontainer setup in the [[Claude Code]] repository (`.devcontainer/` directory) that provides a preconfigured, security-hardened development environment compatible with the VS Code Dev Containers extension. The setup consists of three components: `devcontainer.json` (container settings, extensions, volume mounts), a `Dockerfile` (Node.js 20 base image with development tools), and `init-firewall.sh` (custom firewall script). The container's enhanced security measures—container isolation plus network firewall—are sufficient to safely run `claude --dangerously-skip-permissions`, enabling fully unattended operation without per-action approval prompts.

The key security feature is the `init-firewall.sh` script, which implements a **default-deny outbound network policy**. It whitelists only necessary domains (npm registry, GitHub, Claude API, and similar essential services) and permits outbound DNS and SSH connections, blocking all other external network access. The firewall is validated at container startup. This approach ensures that even if a session is manipulated through [[Prompt Injection]], network exfiltration to unauthorized endpoints is blocked at the container network layer. A warning is noted: despite these protections, `--dangerously-skip-permissions` in a devcontainer does not prevent a malicious project from exfiltrating data accessible within the container, including [[Claude Code]] credentials. Only trusted repositories should be used with this setup.

Session persistence is achieved through Docker volume mounts that preserve command history and configurations between container restarts. The container includes Node.js 20, git, ZSH with productivity enhancements, fzf, pre-configured VS Code extensions, and [[Claude Code]] itself preinstalled. Getting started requires only four steps: install VS Code and the Dev Containers extension, clone the repository, open in VS Code, and select "Reopen in Container." The configuration is designed to be customizable—VS Code extensions, resource allocations, network access permissions, and shell configurations can all be adjusted.

Use cases documented include secure client work isolation (different containers per client project to prevent credential mixing), team onboarding (fully configured environment in minutes), and CI/CD environment consistency (mirror devcontainer config in CI pipelines). The container works across macOS, Windows, and Linux development environments.

## Key Topics

- Reference devcontainer: `devcontainer.json`, `Dockerfile` (Node.js 20), `init-firewall.sh`
- VS Code Dev Containers extension compatibility
- `init-firewall.sh`: default-deny outbound network, whitelisted domains, startup validation
- Enables safe use of `--dangerously-skip-permissions` for unattended operation
- Security warning: malicious repos can still exfiltrate data accessible inside the container
- Session persistence via Docker volume mounts (command history, configurations)
- Included tools: Node.js 20, git, ZSH, fzf, pre-configured VS Code extensions, [[Claude Code]]
- Customization: extensions, resource allocations, network rules, shell config
- Use cases: client project isolation, team onboarding, CI/CD environment parity
- Cross-platform: macOS, Windows, Linux
