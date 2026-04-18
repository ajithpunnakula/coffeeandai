---
title: "Source - Claude Code Zero Data Retention"
type: source
date: 2026-04-13
source_file: "raw/zero-data-retention.md"
tags: [claude-code, privacy, enterprise]
---

# Source - Claude Code Zero Data Retention

[[Zero Data Retention]] is an [[Anthropic]] feature available for [[Claude Code]] when used through Claude for Enterprise. When ZDR is enabled, prompts and model responses are processed in real time and not stored after delivery — except where required by law or to address policy violations. ZDR applies only to [[Anthropic]]'s direct platform; deployments on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]] are governed by those platforms' own retention policies.

ZDR scope is specifically Claude Code inference on Claude for Enterprise. It covers the prompts sent and responses received during terminal Claude Code sessions, regardless of which Claude model is used. ZDR does **not** cover: Chat on claude.ai, Cowork sessions, Claude Code Analytics metadata (account emails, usage statistics — though no prompts/responses are stored in Analytics), user/seat management administrative data, or data processed by third-party tools and [[MCP]] servers. ZDR is enabled on a per-organization basis and must be explicitly requested from an [[Anthropic]] account team for each new organization — it does not automatically extend to new orgs created under the same account.

Three [[Claude Code]] features are automatically disabled when ZDR is enabled because they require storing prompts or completions server-side: [[Source - Claude Code on the Web]] (requires server-side conversation history), [[Source - Claude Code Remote Control|Remote Sessions]] from the Desktop app (requires persistent session data with prompts and completions), and the `/feedback` command (sends conversation data to Anthropic). These are blocked at the backend level — attempting to use them returns a policy error. Future features may also be disabled if they require storing prompts.

Even with ZDR active, [[Anthropic]] may retain data for legal compliance or policy violation response. If a session is flagged for a Usage Policy violation, the associated inputs and outputs may be retained for up to 2 years consistent with standard ZDR policy. ZDR organizations on Claude for Enterprise gain access to administrative capabilities including cost controls per user, an Analytics dashboard, server-managed settings, and audit logs.

## Key Topics

- [[Zero Data Retention]]: prompts and responses not stored after delivery
- Applies to: Claude Code inference on Claude for Enterprise only
- Does not apply to: Bedrock, Vertex AI, Foundry (governed by those platforms)
- Excluded from ZDR coverage: Chat, Cowork, Analytics metadata, admin data, third-party MCP servers
- Per-organization enablement: each org must be enabled separately by [[Anthropic]] account team
- Features disabled under ZDR: [[Source - Claude Code on the Web]], [[Source - Claude Code Remote Control|Remote Sessions]] from Desktop, `/feedback`
- Policy violation exception: data may be retained up to 2 years
- Enterprise administrative capabilities enabled with ZDR: cost controls, Analytics dashboard, server-managed settings, audit logs
- Migration path: pay-as-you-go API ZDR users can transition to Claude for Enterprise
