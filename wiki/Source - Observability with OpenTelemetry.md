---
title: "Source - Observability with OpenTelemetry"
type: source
date: 2026-04-17
source_file: "raw/observability-with-opentelemetry.md"
tags: [agent-sdk, opentelemetry, observability, monitoring]
---

This source documents how the [[Agent SDK]] exports traces, metrics, and log events to observability backends using [[OpenTelemetry]]. The SDK itself does not produce telemetry; instead, it passes configuration to the [[Claude Code]] CLI child process, which has built-in OpenTelemetry instrumentation. The CLI records spans around model requests and tool executions, emits metrics for token and cost counters, and emits structured log events for prompts and tool results.

Telemetry is off by default and requires setting `CLAUDE_CODE_ENABLE_TELEMETRY=1` plus at least one exporter. Three independent signals are available: metrics (counters for tokens, cost, sessions, lines of code, and tool decisions via `OTEL_METRICS_EXPORTER`), log events (structured records for prompts, API requests, errors, and tool results via `OTEL_LOGS_EXPORTER`), and traces (spans for interactions, model requests, tool calls, and hooks via `OTEL_TRACES_EXPORTER` plus `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`). Each signal can be independently enabled.

Configuration is passed as environment variables, either through the process environment (recommended for production) or per-call via `options.env`. The document notes an important difference between Python and TypeScript: in Python, `env` is merged on top of the inherited environment, while in TypeScript, `env` replaces it entirely (requiring `...process.env` spread). The `console` exporter must not be used with the SDK since standard output is the message channel.

Trace spans include `claude_code.interaction` (agent loop turn), `claude_code.llm_request` (API call with model name, latency, tokens), `claude_code.tool` (tool invocation with permission wait and execution child spans), and `claude_code.hook` ([[Hooks]] execution). Sensitive data is not recorded by default; three opt-in variables (`OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT`) add progressively more content to exports.

## Key Topics

- [[OpenTelemetry]] telemetry exported by the [[Claude Code]] CLI child process, not the SDK itself
- Three signals: metrics, log events, and traces (traces in beta)
- Telemetry off by default; requires `CLAUDE_CODE_ENABLE_TELEMETRY=1`
- Traces require `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` (beta feature)
- Span types: `claude_code.interaction`, `claude_code.llm_request`, `claude_code.tool`, `claude_code.hook`
- Compatible with Honeycomb, Datadog, Grafana, Langfuse, and self-hosted OTLP collectors
- Python `env` merges; TypeScript `env` replaces (requires `...process.env` spread)
- `console` exporter must not be used (conflicts with SDK message channel)
- Sensitive data opt-in via `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT`
- Short-lived calls may need reduced export intervals to avoid data loss
