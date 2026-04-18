---
title: "Anthropic"
type: entity
tags: [organization]
sources: ["raw/claude-code-overview.md", "raw/security.md", "raw/data-usage.md", "raw/enterprise-deployment-overview.md"]
---

# Anthropic

Anthropic is an AI safety company and the creator of the Claude family of models, including [[Claude Code]]. The company operates the direct Anthropic API as well as cloud infrastructure for web-based Claude sessions. Anthropic publishes open standards such as the [[MCP]] (MCP), which enables tools and servers to communicate with Claude Code in a standardized way.

Anthropic offers several access tiers for Claude Code: Free, Pro, Max, Team, Enterprise, and API Console access. Enterprise plans unlock features such as [[Source - Claude Code Enterprise Deployment|Enterprise Deployment]] capabilities, centralized billing, audit logs, and enhanced [[Source - Claude Code Security|Security]] controls. For organizations that require data residency or bring-your-own-cloud setups, Claude Code can be routed through [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]] rather than Anthropic's own infrastructure.

Anthropic's data usage policies govern how conversation content is handled across plans. Under the default API Console and consumer plans, prompts and completions are subject to Anthropic's standard retention terms; enterprise agreements may include zero-retention or HIPAA-eligible addenda. Anthropic does not use customer data to train models without explicit consent. See [[Source - Claude Code Data Usage]] and [[Source - Claude Code Security]] for specifics on what data flows through Anthropic-owned infrastructure versus third-party cloud providers.
