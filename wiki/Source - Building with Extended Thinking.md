---
title: "Source - Building with Extended Thinking"
type: source
date: 2026-04-17
source_file: "raw/building-with-extended-thinking.md"
tags: [extended-thinking, api, reasoning, claude-models, prompt-engineering]
---

This source from [[Anthropic]]'s official documentation provides a comprehensive guide to [[Extended Thinking]], a feature that gives Claude enhanced reasoning capabilities for complex tasks by generating internal `thinking` content blocks before delivering a final answer. The feature is eligible for [[Zero Data Retention]] (ZDR).

The document covers model-specific behavior in detail. For Claude Opus 4.7 and later models, manual extended thinking (`thinking: {type: "enabled", budget_tokens: N}`) is no longer supported and returns a 400 error; these models must use adaptive thinking (`thinking: {type: "adaptive"}`) with the effort parameter instead. Claude Opus 4.6 and Claude Sonnet 4.6 still support manual mode but it is deprecated in favor of adaptive thinking. Claude Mythos Preview defaults to adaptive thinking with `display: "omitted"`.

A key concept is summarized thinking: on Claude 4 models, the Messages API returns a summary of Claude's full thinking process rather than the raw output. Users are charged for the full thinking tokens generated, not the summary tokens, meaning billed output token counts will not match visible response tokens. The first few lines of thinking output are more verbose for prompt engineering purposes. Summarization is processed by a different model than the target model, and the thinking model does not see the summarized output.

The `display` field controls how thinking content appears in API responses. Setting it to `"summarized"` returns summarized thinking text (the default on Claude 4 models except Opus 4.7). Setting it to `"omitted"` returns thinking blocks with empty `thinking` fields but retains the encrypted signature for multi-turn continuity, providing faster time-to-first-text-token when streaming. Both modes still charge for full thinking tokens.

The source covers extended thinking with tool use, including interleaved thinking where Claude can think between tool calls within a single response. It explains thinking block preservation requirements for multi-turn conversations: thinking blocks must be passed back unchanged in conversation history with their signatures intact for the server to decrypt and reconstruct original thinking. The document also covers [[Prompt Caching]] behavior with thinking blocks, noting that thinking blocks are stripped before cache lookup since they can vary across identical requests.

Token management is addressed in detail: `budget_tokens` must be less than `max_tokens`, though interleaved thinking with tools can exceed this limit. Claude Opus 4.7 and 4.6 support up to 128k output tokens; Claude Sonnet 4.6 and Haiku 4.5 support up to 64k. The Message Batches API with the `output-300k-2026-03-24` beta header raises limits to 300k for select models.

The source discusses thinking encryption (thinking content is encrypted between turns using a rotating key), redacted thinking blocks (where safety classifiers may redact thinking content), and pricing (thinking tokens are billed at the same per-token rate as output tokens).

## Key Topics
- [[Extended Thinking]] with `thinking` content blocks for enhanced reasoning
- Adaptive thinking (`type: "adaptive"`) as the recommended approach for Claude 4+ models
- Manual thinking (`type: "enabled"`, `budget_tokens`) deprecated on newer models
- Summarized thinking on Claude 4 models with separate billing for full tokens
- `display` field: `"summarized"` vs `"omitted"` for controlling thinking output
- Interleaved thinking between tool calls within a single response
- Thinking block preservation with encrypted signatures for multi-turn conversations
- [[Prompt Caching]] behavior with thinking blocks stripped before cache lookup
- Token budgets and output limits (64k-300k depending on model and API)
- Thinking encryption with rotating keys between turns
- Streaming thinking content with `thinking_delta` events
