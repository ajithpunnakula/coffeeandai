---
title: "Prompt Caching"
type: concept
tags: [optimization, claude-code]
sources: ["raw/model-configuration.md", "raw/manage-costs-effectively.md", "raw/claude-code-on-amazon-bedrock.md", "raw/prompt-caching.md"]
---

# Prompt Caching

Prompt Caching is an [[Anthropic]] API feature that stores repeated context — system prompts, [[CLAUDE.md File]] content, long documents — so subsequent requests reuse the cached version at a fraction of the full token cost. [[Claude Code]] uses prompt caching automatically for several internal workloads: background prompt suggestions, [[Auto-compaction]] summaries, and repeated conversation prefixes that appear across turns in the [[Agentic Loop]].

Caching is available across [[Anthropic]]'s supported platforms. On [[Amazon Bedrock]], prompt caching is available but with regional caveats — not all regions support it, and the cache hit rate depends on how consistently the prefix matches across requests. On [[Google Vertex AI]], caching is similarly supported. Prompt caching can be disabled globally with the `DISABLE_PROMPT_CACHING=1` environment variable, or selectively per model tier in settings.

For scripted or multi-user deployments, the `--exclude-dynamic-system-prompt-sections` CLI flag moves per-machine dynamic content (such as the current working directory or hostname) from the system prompt into the first user message. This improves cache reuse across different machines running the same task, since the system prompt prefix stays identical and the dynamic parts sit in the cacheable user turn.

Prompt caching interacts with other cost management levers: it reduces the effective cost of long [[CLAUDE.md File]] files and persistent [[Skills]] content that would otherwise be re-billed on every turn. It does not cache [[Extended Thinking]] tokens, which are always computed fresh. Combined with lower effort levels and [[Auto-compaction]], prompt caching is one of the primary tools for controlling costs in high-volume [[Claude Code]] deployments.
