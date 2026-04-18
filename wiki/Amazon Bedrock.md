---
title: "Amazon Bedrock"
type: entity
tags: [cloud-provider]
sources: ["raw/claude-code-on-amazon-bedrock.md", "raw/enterprise-deployment-overview.md", "raw/model-configuration.md"]
---

# Amazon Bedrock

Amazon Bedrock is AWS's managed AI service and one of three supported cloud providers for routing [[Claude Code]] traffic away from [[Anthropic]]'s own infrastructure. It provides access to Claude models with IAM-based authentication, making it attractive for enterprises already operating within the AWS ecosystem. Enabling Bedrock routing requires setting the `CLAUDE_CODE_USE_BEDROCK` environment variable; a `/setup-bedrock` wizard automates credential and region configuration.

Bedrock supports model pinning (locking to a specific Claude version), SSO credential refresh for federated identity providers, and Guardrails content filtering that can be applied to all Claude Code requests. An alternative "Mantle" endpoint preserves the native Anthropic API request shape, which simplifies migration and compatibility with tools that expect Anthropic's wire format. Claude Opus 4.6 and Sonnet 4.6 accessed via Bedrock support a 1M token context window. For [[GitHub Actions Integration]] deployments, Bedrock authentication can use OIDC so that no long-lived credentials are stored in CI secrets.

Two features are not available when routing through Bedrock: Fast mode (extended thinking with reduced latency) and computer use (the ability for Claude to control a desktop GUI). Organizations choosing Bedrock for data-residency or compliance reasons should account for these gaps. See [[Source - Claude Code on Amazon Bedrock]] and [[Source - Claude Code Enterprise Deployment]] for configuration details.
