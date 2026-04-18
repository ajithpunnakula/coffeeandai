---
title: "Source - Claude Code on Microsoft Foundry"
type: source
date: 2026-04-13
source_file: "raw/claude-code-on-microsoft-foundry.md"
tags: [claude-code, cloud-providers]
---

# Source - Claude Code on Microsoft Foundry

[[Claude Code]] can route model requests through [[Microsoft Foundry]] (Azure AI Foundry), enabling organizations to use their Azure infrastructure and billing. Prerequisites include an Azure subscription with Foundry access, RBAC permissions to create Foundry resources and deployments, and optionally the Azure CLI. When Foundry is active, `/login` and `/logout` are disabled since authentication is handled via Azure credentials.

Setup involves three steps: provisioning a Microsoft Foundry resource in the Azure portal (ai.azure.com) and creating deployments for Claude Opus, Sonnet, and Haiku; configuring Azure credentials; and setting environment variables. Two authentication methods are supported: API key authentication (copy the key from the resource's "Endpoints and keys" section, set `ANTHROPIC_FOUNDRY_API_KEY`) and Microsoft Entra ID / DefaultAzureCredential (used automatically when the API key env var is absent, supporting local `az login`, service principals, managed identities, and other Azure SDK credential chain methods). The required env vars are `CLAUDE_CODE_USE_FOUNDRY=1` and either `ANTHROPIC_FOUNDRY_RESOURCE` (the resource name, Claude Code constructs the endpoint URL) or `ANTHROPIC_FOUNDRY_BASE_URL` (a full custom URL).

Model version pinning is strongly recommended — more so than for other providers. Because Azure Foundry deployments are tied to specific model versions, using aliases like `sonnet` without pinning can break users when [[Anthropic]] releases a new model version that the existing deployment does not cover. When creating Azure deployments, a specific version should be selected rather than "auto-update to latest." Pin models using `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, and `ANTHROPIC_DEFAULT_HAIKU_MODEL` matching the deployment names created in the portal.

RBAC configuration requires either the `Azure AI User` or `Cognitive Services User` default role, or a custom role granting the `Microsoft.CognitiveServices/accounts/providers/*` data action. There is no interactive setup wizard for Foundry (unlike Bedrock and Vertex AI); all configuration is via environment variables.

## Key Topics

- Azure subscription with Foundry access; RBAC permissions required
- No interactive wizard — configuration is entirely via environment variables
- Step 1: provision Foundry resource and create Claude Opus/Sonnet/Haiku deployments in ai.azure.com
- Two auth methods: API key (`ANTHROPIC_FOUNDRY_API_KEY`) or Entra ID / DefaultAzureCredential chain
- Entra ID supports: `az login`, service principals, managed identities, workload identity, etc.
- Required env vars: `CLAUDE_CODE_USE_FOUNDRY=1` + `ANTHROPIC_FOUNDRY_RESOURCE` or `ANTHROPIC_FOUNDRY_BASE_URL`
- Model pinning is critical: Azure deployments are version-specific; aliases break on new releases
- Select specific model version in Azure portal — do not use "auto-update to latest"
- Pin via `ANTHROPIC_DEFAULT_*_MODEL` matching Azure deployment names
- RBAC: `Azure AI User` or `Cognitive Services User` role; or custom role with `Microsoft.CognitiveServices/accounts/providers/*`
- Troubleshooting: `ChainedTokenCredential authentication failed` means no Entra ID configured — set API key or configure `az login`
