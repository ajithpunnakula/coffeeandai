---
title: "LiteLLM"
type: entity
tags: [tool]
sources: ["raw/llm-gateway-configuration.md", "raw/manage-costs-effectively.md"]
---

# LiteLLM

LiteLLM is an open-source LLM proxy and gateway by BerriAI that provides a unified interface for routing requests to multiple AI providers — including [[Amazon Bedrock]], [[Google Vertex AI]], [[Microsoft Foundry]], and the direct [[Anthropic]] API — with centralized authentication, usage tracking, cost controls, and model routing rules. Enterprises use it as a middle layer between [[Claude Code]] and their chosen cloud provider to gain a single audit log and rate-limit enforcement point across teams.

In the context of Claude Code deployments, LiteLLM is typically deployed as an internal HTTP proxy. Claude Code is configured to send requests to the LiteLLM endpoint rather than directly to the upstream provider, using the [[Source - Claude Code LLM Gateway Configuration|LLM Gateway Configuration]] environment variables. This allows platform teams to enforce per-team spend budgets, log all prompts and completions for compliance, and swap underlying models without reconfiguring individual developer machines.

**Security warning:** LiteLLM versions 1.82.7 and 1.82.8 were found to contain credential-stealing malware — a supply-chain compromise that exfiltrated API keys from the proxy process. Organizations running those versions should rotate all credentials immediately and upgrade. LiteLLM is not affiliated with or security-audited by Anthropic, and enterprises should apply their standard third-party software vetting process before deployment. See [[Source - Claude Code LLM Gateway Configuration]] and [[Source - Claude Code Cost Management]] for configuration guidance.
