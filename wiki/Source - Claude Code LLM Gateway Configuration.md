---
title: "Source - Claude Code LLM Gateway Configuration"
type: source
date: 2026-04-13
source_file: "raw/llm-gateway-configuration.md"
tags: [claude-code, enterprise, configuration]
---

# Source - Claude Code LLM Gateway Configuration

LLM gateways act as a centralized proxy layer between [[Claude Code]] and model providers, enabling centralized authentication, usage tracking, cost controls, audit logging, and model routing. For a gateway to work with [[Claude Code]], it must expose at least one of three API formats: **Anthropic Messages** (`/v1/messages`, `/v1/messages/count_tokens`—must forward `anthropic-beta` and `anthropic-version` headers), **Bedrock InvokeModel** (`/invoke`, `/invoke-with-response-stream`—must preserve `anthropic_beta` and `anthropic_version` body fields), or **Vertex rawPredict** (`:rawPredict`, `:streamRawPredict`, `/count-tokens:rawPredict`—must forward headers). Failure to forward these headers or preserve body fields results in reduced functionality. [[Claude Code]] also sends `X-Claude-Code-Session-Id` on every request, which proxies can use to aggregate session requests without parsing the body.

LiteLLM is a commonly used open-source proxy with detailed configuration guidance. Two authentication methods are documented: **static API key** (set `ANTHROPIC_AUTH_TOKEN` to a fixed key, sent as the `Authorization` header) and **dynamic API key with helper** (use the `apiKeyHelper` settings key pointing to a script that fetches or generates a rotating token; configure refresh interval with `CLAUDE_CODE_API_KEY_HELPER_TTL_MS`). The recommended LiteLLM endpoint is the unified Anthropic format (`ANTHROPIC_BASE_URL=https://litellm-server:4000`) which supports load balancing, fallbacks, and consistent cost tracking. Provider-specific pass-through endpoints are available for Bedrock (`ANTHROPIC_BEDROCK_BASE_URL`) and Vertex (`ANTHROPIC_VERTEX_BASE_URL`).

A critical security warning is documented for LiteLLM: **PyPI versions 1.82.7 and 1.82.8 were compromised with credential-stealing malware**. Any system that installed these versions should remove the package, rotate all credentials, and follow the remediation steps in the LiteLLM issue tracker (BerriAI/litellm#24518). [[Anthropic]] does not endorse, maintain, or audit LiteLLM's security or functionality.

When using the Anthropic Messages API format with a gateway that fronts [[Amazon Bedrock]] or [[Google Vertex AI]], [[Claude Code]] may send beta headers that some proxies reject. Setting `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` strips those headers. Custom model names on gateways are handled using the model configuration environment variables documented in [[Source - Claude Code Model Configuration]].

## Key Topics

- LLM gateway benefits: centralized auth, usage tracking, cost controls, audit logging, model routing
- Three required API format options: Anthropic Messages, Bedrock InvokeModel, Vertex rawPredict
- Required header/field passthrough: `anthropic-beta`, `anthropic-version`
- `X-Claude-Code-Session-Id` header for session aggregation in proxies
- LiteLLM static API key auth: `ANTHROPIC_AUTH_TOKEN`
- LiteLLM dynamic API key auth: `apiKeyHelper` script + `CLAUDE_CODE_API_KEY_HELPER_TTL_MS`
- Unified endpoint (recommended) vs. provider pass-through endpoints
- SECURITY WARNING: LiteLLM versions 1.82.7-1.82.8 contained credential-stealing malware
- `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` for proxies that reject beta headers
- Custom model name mapping via `ANTHROPIC_DEFAULT_*_MODEL` env vars
