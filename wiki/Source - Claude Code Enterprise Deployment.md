---
title: "Source - Claude Code Enterprise Deployment"
type: source
date: 2026-04-13
source_file: "raw/enterprise-deployment-overview.md"
tags: [claude-code, enterprise]
---

# Source - Claude Code Enterprise Deployment

[[Claude Code]] offers multiple deployment paths for organizations, each suited to different infrastructure and compliance needs. The five options are Claude for Teams, Claude for Enterprise, Anthropic Console, [[Amazon Bedrock]], [[Google Vertex AI]], and [[Microsoft Foundry]]. Teams and Enterprise plans are the recommended path for most organizations because they include Claude on the web, centralized billing, and admin tooling without requiring custom infrastructure. Console access is billed pay-as-you-go and suited to individual developers. Cloud provider routes (Bedrock, Vertex, Foundry) are best for organizations with existing AWS, GCP, or Azure commitments that need data-residency control.

Network routing can be layered on top of any provider. A corporate proxy (configured via `HTTPS_PROXY` / `HTTP_PROXY`) routes all outbound traffic through an enterprise proxy for security monitoring. An [[Source - Claude Code LLM Gateway Configuration|LLM Gateway]] sits between [[Claude Code]] and the cloud provider to handle centralized authentication, rate limiting, and usage tracking, configured via `ANTHROPIC_BASE_URL`, `ANTHROPIC_BEDROCK_BASE_URL`, or `ANTHROPIC_VERTEX_BASE_URL`. The two approaches can be combined, and the `/status` command verifies active configuration.

[[Anthropic]] recommends several organizational best practices. Documentation investment is highest-priority: deploy CLAUDE.md files at the organization level (system directories) and in each repository root, checked into source control. For cloud provider deployments, pin model versions using `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, and `ANTHROPIC_DEFAULT_HAIKU_MODEL` to control when users migrate to new model releases. Managed [[Permission Modes]] can be enforced centrally so security teams control what Claude Code is and is not allowed to do. [[MCP]] integration is recommended for connecting Claude Code to internal tooling such as ticket systems or error logs, with a central team checking `.mcp.json` into the codebase.

For rollout, the source recommends a "one click" install path to drive adoption, starting users with codebase Q&A and smaller bug fixes before moving to more agentic usage. After choosing a deployment option, next steps are: distribute install instructions, create repository-level CLAUDE.md files, and review security settings.

## Key Topics

- Comparison table: Teams/Enterprise vs. Console vs. Bedrock vs. Vertex AI vs. Foundry across billing, regions, auth, cost tracking, and enterprise features
- Corporate proxy configuration (`HTTPS_PROXY`) per provider with example environment variables
- LLM Gateway configuration (`ANTHROPIC_BEDROCK_BASE_URL`, `ANTHROPIC_VERTEX_BASE_URL`, `ANTHROPIC_FOUNDRY_BASE_URL`) per provider
- CLAUDE.md deployment at organization-wide and repository levels
- Model version pinning for cloud providers to avoid unexpected upgrades
- Managed security policies for organization-wide [[Permission Modes]]
- MCP integration pattern: central team configures, checks `.mcp.json` into codebase
- Rollout best practices: one-click install, guided onboarding, incremental autonomy
