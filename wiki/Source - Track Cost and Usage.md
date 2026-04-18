---
title: "Source - Track Cost and Usage"
type: source
date: 2026-04-17
source_file: "raw/track-cost-and-usage.md"
tags: [agent-sdk, cost-tracking, usage, api]
---

This source is the official [[Agent SDK]] documentation for tracking token usage, deduplicating parallel tool calls, and estimating costs. It explains how the SDK provides detailed token usage information for each interaction with Claude, with important caveats about the accuracy of client-side cost estimates.

The documentation distinguishes three scopes for usage data: a `query()` call (one SDK invocation that can involve multiple steps), a step (a single request/response cycle within a query), and a session (a series of query calls linked by session ID using the `resume` option). Both TypeScript and Python SDKs expose the same granularity with different field naming conventions.

A key warning is that `total_cost_usd` and `costUSD` fields are client-side estimates, not authoritative billing data. The SDK computes them locally from a price table bundled at build time, which can drift from actual billing when pricing changes, the installed SDK version does not recognize a model, or billing rules apply that the client cannot model. For authoritative billing, the Usage and Cost API or the Claude Console Usage page should be used instead.

For per-step tracking, each assistant message contains a nested message with an ID and usage object containing input_tokens and output_tokens. When Claude uses multiple tools in parallel, all messages in that turn share the same ID with identical usage data, requiring deduplication by ID to avoid double-counting. The result message provides cumulative `total_cost_usd` across all steps in a query call, working for both success and error results.

Per-model usage breakdown is available through the `modelUsage` (TypeScript) or `model_usage` (Python) field on the result message, showing cost and token breakdown when running multiple models (e.g., Haiku for subagents and Opus for the main agent). For multi-query sessions, each `query()` call reports its own cost independently, and developers must accumulate totals manually.

The source covers caching integration, noting that the [[Agent SDK]] automatically uses [[Prompt Caching]] to reduce costs. The usage object includes `cache_creation_input_tokens` (charged at higher rate) and `cache_read_input_tokens` (charged at reduced rate). Failed conversations still consume tokens up to the point of failure, and cost data should always be read from the result message regardless of success or error status.

## Key Topics

- Token usage tracking at query, step, and session scopes
- `total_cost_usd` as client-side estimate, not authoritative billing
- Deduplication of parallel tool call messages by ID
- Per-step and per-model usage breakdowns
- TypeScript versus Python SDK field naming conventions
- Manual accumulation required for multi-query session costs
- [[Prompt Caching]] integration with cache_creation and cache_read tokens
- Failed conversations still incur token costs
- Usage and Cost API for authoritative billing data
- [[Agent SDK]] automatic prompt caching for cost reduction
