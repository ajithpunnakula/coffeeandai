---
title: "Google Vertex AI"
type: entity
tags: [cloud-provider]
sources: ["raw/claude-code-on-google-vertex-ai.md", "raw/enterprise-deployment-overview.md", "raw/model-configuration.md"]
---

# Google Vertex AI

Google Vertex AI is Google Cloud's managed AI platform and one of the three supported bring-your-own-cloud providers for [[Claude Code]], alongside [[Amazon Bedrock]] and [[Microsoft Foundry]]. It provides access to Claude models under the customer's own GCP billing and data-residency controls. Routing Claude Code through Vertex AI requires setting the `CLAUDE_CODE_USE_VERTEX` environment variable; a `/setup-vertex` wizard (available from Claude Code v2.1.98+) automates project, region, and credential setup.

Authentication uses Google's Application Default Credentials (ADC) mechanism, which supports service accounts, Workload Identity Federation for CI/CD (including [[GitHub Actions Integration]]), and user credentials via `gcloud auth`. Vertex AI supports both regional endpoints (for strict data-residency) and global endpoints, with per-model region overrides available for teams that run different models in different regions. Access to Claude models via Vertex AI's Model Garden must be approved by Google, and approval can take 24–48 hours after first request.

The 1M token context window is supported on Vertex AI for compatible Claude versions. Like [[Amazon Bedrock]], Vertex AI routing means traffic does not pass through [[Anthropic]] infrastructure, which is significant for compliance-sensitive deployments. See [[Source - Claude Code on Google Vertex AI]] and [[Source - Claude Code Enterprise Deployment]] for full configuration reference.
