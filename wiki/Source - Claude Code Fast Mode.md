---
title: "Source - Claude Code Fast Mode"
type: source
date: 2026-04-13
source_file: "raw/speed-up-responses-with-fast-mode.md"
tags: [claude-code, features]
---

# Source - Claude Code Fast Mode

[[Fast Mode]] is a high-speed API configuration for [[Claude Code]] using Opus 4.6 that delivers approximately 2.5x faster responses at a cost of $30/$150 per million tokens (input/output). It is toggled per-session with the `/fast` command. Despite the name, Fast Mode does not use a different or smaller model — it is the same Opus 4.6 at identical quality, with the speed improvement coming from infrastructure-level optimizations.

Fast Mode is not available on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]], as it depends on Anthropic-hosted routing infrastructure. When rate limits are encountered, [[Claude Code]] automatically falls back from Fast Mode to standard API access, ensuring continuity without requiring user intervention.

For enterprise deployments, the `fastModePerSessionOptIn` managed setting controls whether Fast Mode is available to users. This allows organizations to gate access for cost control purposes, preventing teams from defaulting to Fast Mode for all sessions without explicit cost authorization. This setting is managed via [[Source - Claude Code Settings Reference|Claude Code Settings]] rather than user-level configuration.

## Key Topics

- 2.5x faster responses using Opus 4.6
- Cost: $30/$150 per million tokens (input/output)
- Toggle via `/fast` command per session
- Same model and quality as standard mode — infrastructure optimization only
- Not available on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]]
- Auto-fallback to standard API on rate limit
- `fastModePerSessionOptIn` managed setting for enterprise cost control
- Managed via [[Source - Claude Code Settings Reference|Claude Code Settings]]
