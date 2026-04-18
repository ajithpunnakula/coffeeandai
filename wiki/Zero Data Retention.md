---
title: "Zero Data Retention"
type: concept
tags: [privacy, enterprise, claude-code]
sources: ["raw/zero-data-retention.md", "raw/data-usage.md", "raw/track-team-usage-with-analytics.md"]
---

# Zero Data Retention

Zero Data Retention (ZDR) is an enterprise feature where [[Claude Code]] inference inputs (prompts) and outputs (model responses) are not stored by [[Anthropic]] after the API response is returned. It is available only for Claude for Enterprise organizations and must be enabled per-organization by the Anthropic account team — it cannot be self-serve activated.

ZDR applies specifically to Claude Code inference on [[Anthropic]]'s direct API platform. It does not extend to the Chat UI, Cowork features, Analytics metadata, admin and seat management data, or third-party integrations. When users route through [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]], data retention is governed by those platforms' policies rather than Anthropic's ZDR program.

Several [[Claude Code]] features are disabled under ZDR because they depend on server-side persistence. Disabled features include: web sessions (claude.ai/code browser interface), [[Claude Desktop App]] remote sessions, the `/feedback` command, [[Source - Claude Code Code Review|Code Review]], and contribution metrics. These features rely on Anthropic storing at least transient session state, which ZDR prohibits.

One notable exception to the "no retention" guarantee: policy violation data may be retained for up to 2 years for trust and safety purposes, regardless of ZDR status. [[Auto Memory]] is also disabled under ZDR organizations, as storing learned project notes across sessions would require server-side persistence. Enterprises seeking ZDR-compatible memory alternatives should rely on [[CLAUDE.md File]] (human-authored, checked into git) rather than machine-generated notes.
