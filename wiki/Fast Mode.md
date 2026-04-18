---
title: "Fast Mode"
type: concept
tags: [features, claude-code]
sources: ["raw/speed-up-responses-with-fast-mode.md", "raw/model-configuration.md"]
---

# Fast Mode

Fast Mode is a [[Claude Code]] configuration that enables a high-throughput API pathway for Claude Opus 4.6, delivering approximately 2.5x faster responses at a higher cost tier ($30 per million input tokens / $150 per million output tokens). It is toggled on or off with the `/fast` slash command, and the setting persists across sessions by default.

Fast Mode does not use a different or smaller model — it is the same Claude Opus 4.6 producing the same quality output, routed through an infrastructure configuration optimized for speed over cost efficiency. This makes it appropriate for interactive workflows where latency is the bottleneck, rather than background or batch tasks where cost matters more.

There are several constraints. Fast Mode is only available on [[Anthropic]]'s direct API platform; it is not available on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]], which use their own provisioned throughput systems. Usage is billed as extra usage from the first token, regardless of subscription plan. If the fast mode rate limit is hit, [[Claude Code]] automatically falls back to standard Opus throughput rather than erroring.

For organizations deploying [[Claude Code]] at scale, the `fastModePerSessionOptIn` managed setting (configured via [[Source - Claude Code Server-Managed Settings|Server-Managed Settings]]) forces users to opt in to Fast Mode per session rather than having it on persistently, providing cost control at the fleet level. Fast Mode can be combined with lower [[Extended Thinking]] effort levels (e.g., `/effort low`) for maximum speed on tasks that do not require deep reasoning.
