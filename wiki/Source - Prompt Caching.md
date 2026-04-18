---
title: "Source - Prompt Caching"
type: source
date: 2026-04-17
source_file: "raw/prompt-caching.md"
tags: [api, caching, optimization, pricing]
---

This source is [[Anthropic]]'s official documentation for [[Prompt Caching]], a feature that optimizes API usage by allowing resumption from specific prefixes in prompts. It significantly reduces processing time and costs for repetitive tasks or prompts with consistent elements, and is eligible for Zero Data Retention (ZDR).

There are two ways to enable prompt caching. Automatic caching adds a single `cache_control` field at the top level of the request, and the system automatically applies the cache breakpoint to the last cacheable block, moving it forward as conversations grow. This is best for multi-turn conversations. Explicit cache breakpoints place `cache_control` directly on individual content blocks for fine-grained control, supporting up to 4 breakpoints per request.

The caching mechanism works by checking if a prompt prefix up to a specified cache breakpoint is already cached from a recent query. If found, the cached version is used; otherwise, the full prompt is processed and the prefix is cached once the response begins. The default cache lifetime is 5 minutes (refreshed at no cost on each use), with an optional 1-hour TTL at 2x base input token price. Cache reads cost only 10% of base input token price, while 5-minute cache writes cost 1.25x and 1-hour writes cost 2x the base price.

The source details minimum cacheable prompt lengths that vary by model: 4096 tokens for Claude Opus 4.7/4.6/4.5, 2048 tokens for Claude Sonnet 4.6, 1024 tokens for Claude Sonnet 4.5/Opus 4.1/Opus 4/Sonnet 4/Sonnet 3.7, 4096 tokens for Haiku 4.5, and 2048 tokens for Haiku 3.5/Haiku 3. Content that can be cached includes tools, system messages, text messages, images, documents, tool use, and tool results. Thinking blocks cannot be cached directly but can be cached alongside other content in assistant turns.

The documentation explains cache invalidation rules following the hierarchy: tools, system, then messages. Changes to tool definitions invalidate the entire cache, while changes to tool_choice only affect message blocks. The lookback mechanism checks at most 20 positions per breakpoint when searching for prior cache entries, which is important for long conversations. Cache storage uses workspace-level isolation (as of February 2026), ensuring data separation between workspaces.

Interaction with [[Extended Thinking]] is detailed: thinking blocks get cached as part of request content during tool use flows, but non-tool-result user content causes all previous thinking blocks to be stripped from context, invalidating the cache. Best practices include starting with automatic caching for multi-turn conversations, placing stable content at the beginning, and placing breakpoints on the last block that stays identical across requests.

## Key Topics

- Automatic caching versus explicit cache breakpoints
- Cache pricing: 10% for reads, 125% for 5-minute writes, 200% for 1-hour writes
- 5-minute default TTL with optional 1-hour duration
- Model-specific minimum cacheable token thresholds
- Cache invalidation hierarchy: tools, system, messages
- 20-block lookback window for finding prior cache entries
- Workspace-level cache isolation (since February 2026)
- [[Extended Thinking]] interaction with caching behavior
- Cacheable content types: tools, system, messages, images, documents
- Usage tracking via cache_creation_input_tokens and cache_read_input_tokens
- Best practices for multi-turn conversations and static prefixes
