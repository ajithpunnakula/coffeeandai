---
title: "Source - Claude Code on Google Vertex AI"
type: source
date: 2026-04-13
source_file: "raw/claude-code-on-google-vertex-ai.md"
tags: [claude-code, cloud-providers]
---

# Source - Claude Code on Google Vertex AI

[[Claude Code]] can route model requests through [[Google Vertex AI]] instead of [[Anthropic]]'s direct API, enabling GCP-billed access using standard Google Cloud authentication. Prerequisites include a GCP account with billing enabled, the Vertex AI API enabled in the project, model access requested via the Vertex AI Model Garden (approval may take 24–48 hours), `gcloud` installed and configured, and sufficient quota in the desired region. When Vertex AI is active, `/login` and `/logout` are disabled.

The interactive setup wizard (`/setup-vertex`, requires Claude Code v2.1.98+) detects GCP credentials (Application Default Credentials, service account key, or environment credentials), the project, and region; verifies model access; and optionally pins model versions, saving the result to the user settings file's `env` block. Manual setup via environment variables requires: `CLAUDE_CODE_USE_VERTEX=1`, `CLOUD_ML_REGION` (can be `global` for the global endpoint), and `ANTHROPIC_VERTEX_PROJECT_ID`. Optional overrides include `ANTHROPIC_VERTEX_BASE_URL` for custom gateways, `DISABLE_PROMPT_CACHING=1`, and per-model region overrides (`VERTEX_REGION_CLAUDE_HAIKU_4_5`, `VERTEX_REGION_CLAUDE_4_6_SONNET`, etc.) when using the global endpoint but specific models require a regional endpoint.

Vertex AI supports both global and regional endpoints, though not all models support global endpoints in all regions. Model pinning is strongly recommended for team deployments: aliases resolve to the latest version, which may not be enabled in the project when [[Anthropic]] releases an update. Pin with `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL` using Vertex model IDs (e.g. `claude-sonnet-4-6`, `claude-haiku-4-5@20251001`). Claude Opus 4.6, Sonnet 4.6, Sonnet 4.5, and Sonnet 4 support the 1M token context window on Vertex AI (append `[1m]` to the model ID).

The required IAM role is `roles/aiplatform.user`, which grants `aiplatform.endpoints.predict` for model invocation and token counting. Startup model checks (v2.1.98+) prompt to update outdated pins and fall back to the previous version if the default is unavailable in the project.

## Key Topics

- Requires Vertex AI API enabled, Model Garden access request (24–48 hour approval)
- Interactive wizard: `/setup-vertex` (v2.1.98+); manual via env vars for CI/enterprise
- Required env vars: `CLAUDE_CODE_USE_VERTEX=1`, `CLOUD_ML_REGION`, `ANTHROPIC_VERTEX_PROJECT_ID`
- Authentication: Application Default Credentials (`gcloud`), service account key, or env credentials
- Global vs. regional endpoints: not all models support global; use `VERTEX_REGION_*` for per-model overrides
- Model pinning via `ANTHROPIC_DEFAULT_*_MODEL` with Vertex model IDs
- Default models: `claude-sonnet-4-5@20250929` (primary), `claude-haiku-4-5@20251001` (small/fast)
- 1M token context: Opus 4.6, Sonnet 4.6, Sonnet 4.5, Sonnet 4; append `[1m]` to model ID
- IAM: `roles/aiplatform.user` (grants `aiplatform.endpoints.predict`)
- Startup model checks (v2.1.98+): prompt to update pins; fallback to previous version
- Prompt caching supported; disable with `DISABLE_PROMPT_CACHING=1`
- Troubleshooting: 404 "model not found" (check Model Garden access, region support); 429 (switch to global or check region support)
