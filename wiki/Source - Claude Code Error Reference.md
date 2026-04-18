---
title: "Source - Claude Code Error Reference"
type: source
date: 2026-04-17
source_file: "raw/error-reference.md"
tags: [errors, troubleshooting, api, authentication, claude-code]
---

This source from the [[Claude Code]] official documentation catalogs runtime error messages, their meanings, and recovery steps. It covers errors across the CLI, the Desktop app, and Claude Code on the web, since all three share the same underlying CLI. The document notes that [[Claude Code]] calls the Claude API for model responses, so most runtime errors map to underlying API error codes.

The automatic retry system is documented in detail: [[Claude Code]] retries transient failures (server errors, overloaded responses, timeouts, temporary 429 throttles, dropped connections) up to 10 times with exponential backoff before surfacing an error. Two environment variables control this behavior: `CLAUDE_CODE_MAX_RETRIES` (default 10) and `API_TIMEOUT_MS` (default 600000ms / 10 minutes).

Server errors include 500 Internal Server Error (check status.claude.com), repeated 529 Overloaded errors (API at capacity across all users, not a personal quota issue), request timeouts, and auto mode safety classification failures when the classifier model is unavailable. The document clarifies that 529 errors do not count against user quotas and recommends switching models via `/model` since capacity is tracked per model.

Usage limit errors cover session limits, weekly limits, and per-model limits (e.g., Opus limits). Recovery options include waiting for the reset time shown in the error, running `/usage` to check limits, or running `/extra-usage` to purchase additional usage. The document also covers rate limiting (429 errors) from API keys or cloud provider projects, and credit balance depletion for Console organizations.

Authentication errors include missing credentials, invalid API keys, disabled organizations (where a stale `ANTHROPIC_API_KEY` overrides subscription login), OAuth token revocation/expiration, and OAuth scope mismatches. The document explains authentication precedence: environment variables take priority over `/login`, and non-interactive mode (`-p`) always uses the key when present.

Network errors cover connection failures (TCP failures, VPN blocking, corporate proxy misconfiguration) and SSL certificate errors from TLS-intercepting proxies. Request errors include prompt-too-long (recoverable with `/compact` or `/clear`), compaction failures, request size limits (30 MB), image dimension limits, PDF processing limits, beta header stripping by gateways, model access issues, thinking budget configuration errors, and tool use/thinking block mismatches recoverable with `/rewind`.

The document also addresses response quality degradation without explicit errors, pointing to model selection, effort level, [[Context Window]] pressure, and stale instructions in [[CLAUDE.md File]] files as common causes.

## Key Topics
- Automatic retry system with 10 attempts and exponential backoff
- `CLAUDE_CODE_MAX_RETRIES` and `API_TIMEOUT_MS` environment variables
- 529 Overloaded errors vs personal usage limits (distinct concepts)
- `/usage` and `/extra-usage` commands for limit management
- Authentication precedence: environment variables override `/login`
- OAuth token management with `/login` and `/logout`
- Network errors: proxy configuration, `HTTPS_PROXY`, `NODE_EXTRA_CA_CERTS`
- [[Context Window]] pressure: `/compact`, `/clear`, `/context` for diagnosis
- [[Checkpointing]] with `/rewind` for recovering from tool use mismatches
- Response quality troubleshooting: `/model`, `/effort`, `/context`, `/doctor`
- `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` for gateway compatibility
