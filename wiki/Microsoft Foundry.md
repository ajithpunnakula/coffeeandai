---
title: "Microsoft Foundry"
type: entity
tags: [cloud-provider]
sources: ["raw/claude-code-on-microsoft-foundry.md", "raw/enterprise-deployment-overview.md", "raw/model-configuration.md"]
---

# Microsoft Foundry

Microsoft Foundry (formerly Azure AI Studio) is Microsoft's Azure-hosted AI service for deploying and serving Claude models. It is one of three supported bring-your-own-cloud providers for [[Claude Code]], alongside [[Amazon Bedrock]] and [[Google Vertex AI]]. Routing Claude Code through Foundry requires setting the `CLAUDE_CODE_USE_FOUNDRY` environment variable. Unlike Bedrock and Vertex AI, there is no setup wizard — configuration is done entirely through environment variables.

Foundry supports two authentication methods: a static API key or Microsoft Entra ID (formerly Azure Active Directory) via the `DefaultAzureCredential` chain, which enables federated identity and managed identity authentication without hardcoded secrets. Model version pinning is strongly recommended: each Foundry deployment is tied to a specific model version created in the Azure portal, and mismatches between the requested model and the deployed version will cause errors. Teams should create and name deployments carefully to match the version strings expected by [[Claude Code]].

Because Foundry runs within Azure infrastructure, traffic does not pass through [[Anthropic]] servers, making it suitable for organizations with Azure-first data-residency requirements. See [[Source - Claude Code on Microsoft Foundry]] and [[Source - Claude Code Enterprise Deployment]] for environment variable reference and deployment setup instructions.
