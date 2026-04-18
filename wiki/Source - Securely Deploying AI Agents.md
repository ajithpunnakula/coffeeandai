---
title: "Source - Securely Deploying AI Agents"
type: source
date: 2026-04-17
source_file: "raw/securely-deploying-ai-agents.md"
tags: [agent-sdk, security, deployment, isolation]
---

This source provides a comprehensive guide to securing [[Claude Code]] and [[Agent SDK]] deployments, covering isolation technologies, credential management, network controls, and filesystem configuration. The core challenge is that unlike traditional software following predetermined code paths, agents generate actions dynamically based on context, making their behavior susceptible to prompt injection -- instructions embedded in content they process.

The document outlines [[Claude Code]]'s built-in security features: a permissions system allowing tool and bash command configuration with glob patterns, command parsing via AST for permission matching, web search summarization to reduce prompt injection risk, and [[Sandboxing]] mode for restricting filesystem and network access. Three security principles guide additional hardening: security boundaries (separating components with different trust levels), least privilege (restricting capabilities to only what is needed), and defense in depth (layering multiple controls).

Four isolation technologies are compared. Sandbox runtime provides good isolation with very low overhead and low complexity, using OS primitives like `bubblewrap` on Linux and `sandbox-exec` on macOS. Containers (Docker) offer setup-dependent isolation with low overhead. gVisor provides excellent isolation by intercepting system calls in userspace, with medium-to-high overhead. VMs (Firecracker, QEMU) provide excellent hardware-level isolation with high overhead. All approaches place the agent inside the isolation boundary.

The proxy pattern is the recommended approach for credential management: a proxy runs outside the agent's security boundary and injects credentials into outgoing requests. [[Claude Code]] supports `ANTHROPIC_BASE_URL` for sampling API requests and `HTTP_PROXY`/`HTTPS_PROXY` for system-wide routing. The document covers TLS-terminating proxies for modifying HTTPS traffic to arbitrary services, mentioning tools like Envoy, mitmproxy, Squid, and [[LiteLLM]]. Cloud deployments can combine container isolation with VPC network controls and proxy-based credential injection.

## Key Topics

- Agents are susceptible to prompt injection due to dynamic action generation
- Built-in security: permissions system, AST command parsing, web search summarization, [[Sandboxing]]
- Four isolation technologies: sandbox runtime, containers, gVisor, VMs (Firecracker)
- Proxy pattern for credential management: agent never sees actual credentials
- `ANTHROPIC_BASE_URL` routes sampling requests; `HTTP_PROXY`/`HTTPS_PROXY` for system-wide routing
- Docker hardening: `--cap-drop ALL`, `--network none`, `--read-only`, Unix socket architecture
- gVisor intercepts system calls in userspace, reducing kernel attack surface
- Filesystem controls: read-only code mounting, tmpfs for ephemeral workspaces, overlay filesystems
- Cloud deployment: private subnets, firewall rules, proxy-based credential injection
- Credential files to exclude: `.env`, `~/.aws/credentials`, `~/.git-credentials`, `*.pem`/`*.key`
