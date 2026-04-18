---
id: card_f6b1e3a5
type: page
order: 27
difficulty: 2
title: "Context Optimization and Positioning"
domain: "Context Management & Reliability"
wiki_refs: ["Context Window", "Auto-compaction"]
source: "raw/context-management-reliability.md"
content_hashes:
  Context Window: "a1b2c3d4"
  Auto-compaction: "e5f6a7b8"
speaker_notes: "This card covers the practical strategies for managing context window space effectively. Emphasize that progressive summarization is a silent killer — it doesn't fail loudly, it just gradually degrades quality. The 'lost in the middle' effect is well-documented in research and has direct implications for how architects should structure prompts and context. Walk through a concrete example: a customer support conversation where 'John Smith, account ACC-12345, order #98765, charged $247.99 twice on 2026-03-15' becomes 'billing issue' after 2-3 summarization rounds. The fix is architectural, not procedural."
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_f6b1e3a5-HfGi8dVQubRJPGUetLI0nhJOIIR2xT.mp3"
---

## Context Optimization and Positioning

### The Progressive Summarization Trap

Progressive summarization is a common strategy for managing long conversations within a finite context window, but it carries a hidden and serious risk: **each summarization round silently destroys specifics**. Consider a customer support scenario where the original context contains "John Smith, account ACC-12345, order #98765, charged $247.99 twice on 2026-03-15." After two or three rounds of summarization, this rich, actionable detail collapses into a vague label like "billing issue." The model continues operating confidently, unaware that it has lost the very details needed to resolve the case.

This degradation is particularly dangerous because it is **silent** — no error is raised, no warning is triggered. The model simply proceeds with impoverished context, producing plausible but potentially incorrect or unhelpful responses.

### Solution: Immutable Case Facts Blocks

The architectural remedy is to maintain an **immutable "case facts" block pinned at the START of the context**. This block contains all critical specifics — names, identifiers, amounts, dates — and is never subject to summarization. By placing it at the beginning, it occupies a **high-recall position** in the [[Context Window]].

### The "Lost in the Middle" Effect

Research has demonstrated that information placed in the **middle** of long contexts is significantly less likely to be recalled by the model. The two high-recall positions are:

1. **Beginning** of the context (primacy effect)
2. **End** of the context (recency effect)

This has direct architectural implications: critical instructions and reference data should be positioned at the start, while the most recent conversational turns naturally occupy the end.

### Practical Techniques

- **Trim verbose tool outputs**: Tool call results often contain far more detail than needed. Truncate or extract only relevant fields before inserting into context.
- **Use [[Auto-compaction]]**: The `/compact` command reclaims context space by summarizing the conversation so far. Use it proactively before hitting limits, not after.
- **Scratchpad files for persistent state**: When context resets are inevitable (new conversations, compaction events), write critical state to a scratchpad file on disk. This ensures continuity across context boundaries — the model can read the file to restore its working state.
