---
title: "Source - Hosting the Agent SDK"
type: source
date: 2026-04-17
source_file: "raw/hosting-the-agent-sdk.md"
tags: [agent-sdk, hosting, deployment, production]
---

This source covers deployment and hosting considerations for the [[Agent SDK]] in production environments. Unlike traditional stateless LLM APIs, the Agent SDK operates as a long-running process that maintains conversational state, executes commands in a persistent shell environment, manages file operations, and handles tool execution with context from previous interactions.

The hosting requirements specify container-based sandboxing for security and isolation. Each SDK instance needs Python 3.10+ or Node.js 18+ as a runtime, with recommended resource allocation of 1 GiB RAM, 5 GiB disk, and 1 CPU. Network access requires outbound HTTPS to `api.anthropic.com`, plus optional access to [[MCP]] servers or external tools. The document lists several sandbox providers: Modal Sandbox, Cloudflare Sandboxes, Daytona, E2B, Fly Machines, and Vercel Sandbox.

Four production deployment patterns are described. **Ephemeral Sessions** create a new container per user task and destroy it when complete, suited for one-off tasks like bug investigation, invoice processing, or translation. **Long-Running Sessions** maintain persistent container instances, often running multiple Agent SDK processes, ideal for email agents, site builders, or high-frequency chatbots. **Hybrid Sessions** use ephemeral containers hydrated with history and state (via database or session resumption), best for intermittent interactions like project management or deep research. **Single Containers** run multiple Agent SDK processes in one global container for closely collaborating agents, such as simulations.

The FAQ section notes that the dominant cost of serving agents is tokens rather than container compute (roughly 5 cents per hour minimum for containers). Agent sessions do not time out on their own, but setting `maxTurns` is recommended to prevent runaway loops. Container health monitoring uses standard backend logging infrastructure.

## Key Topics

- Container-based sandboxing requirements for the [[Agent SDK]]
- Resource allocation: 1 GiB RAM, 5 GiB disk, 1 CPU per instance
- Ephemeral session pattern for one-off tasks
- Long-running session pattern for persistent agents
- Hybrid session pattern with state hydration
- Single container pattern for collaborating agents
- Sandbox providers (Modal, Cloudflare, Daytona, E2B, Fly Machines, Vercel)
- Token cost as dominant expense vs. container compute
- `maxTurns` to prevent runaway [[Agentic Loop]] execution
- Network requirements (outbound HTTPS to api.anthropic.com)
- [[MCP]] server connectivity from containers
