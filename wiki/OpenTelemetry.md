---
title: "OpenTelemetry"
type: entity
tags: [tool, observability]
sources: ["raw/monitoring.md", "raw/security.md", "raw/environment-variables.md", "raw/observability-with-opentelemetry.md"]
---

# OpenTelemetry

OpenTelemetry (OTel) is the open standard for collecting and exporting telemetry data — metrics, logs/events, and traces — from software systems. [[Claude Code]] integrates with OpenTelemetry to give teams structured observability into AI-assisted development workflows. The integration is enabled by setting the `CLAUDE_CODE_ENABLE_TELEMETRY` environment variable and configuring an OTLP endpoint.

Claude Code emits three categories of telemetry. Metrics cover session counts, token usage, estimated cost, lines of code changed, and git commits made. Events and logs capture individual prompts, tool call results, and raw API requests (with content redaction options for sensitive data). Distributed tracing is in beta and uses the W3C `traceparent` header format, allowing Claude Code spans to be correlated with parent traces from the application or CI system that invoked Claude. Supported observability backends include Prometheus (for metrics scraping), ClickHouse, Honeycomb, Datadog, and Jaeger.

Because telemetry data can include prompt content and tool outputs, [[Anthropic]] recommends reviewing redaction settings — particularly `CLAUDE_CODE_TELEMETRY_REDACT_CONTENT` — before enabling in production environments with sensitive codebases. Telemetry flows from the Claude Code process to the configured OTLP collector on the local network or a cloud backend; it does not pass through Anthropic infrastructure. See [[Source - Claude Code Monitoring]], [[Source - Claude Code Security]], and [[Source - Claude Code Environment Variables]] for full configuration reference.
