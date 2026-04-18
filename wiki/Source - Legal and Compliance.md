---
title: "Source - Legal and Compliance"
type: source
date: 2026-04-17
source_file: "raw/legal-and-compliance.md"
tags: [legal, compliance, security, authentication, healthcare]
---

This source from the [[Claude Code]] official documentation covers legal agreements, compliance certifications, and security information. It establishes the licensing framework: Commercial Terms apply to Team, Enterprise, and Claude API users, while Consumer Terms of Service apply to Free, Pro, and Max users. Existing commercial agreements with [[Anthropic]] (whether through the Claude API directly or via [[Amazon Bedrock]] or [[Google Vertex AI]]) extend to [[Claude Code]] usage unless mutually agreed otherwise.

For healthcare compliance, the document confirms that Business Associate Agreements (BAAs) automatically extend to cover [[Claude Code]] if the customer has executed a BAA and has [[Zero Data Retention]] (ZDR) activated. ZDR is enabled on a per-organization basis, so each organization must have it enabled separately for BAA coverage. The BAA applies to API traffic flowing through [[Claude Code]].

The acceptable use section notes that [[Claude Code]] usage is subject to the [[Anthropic]] Usage Policy. Advertised usage limits for Pro and Max plans assume ordinary, individual usage of [[Claude Code]] and the [[Agent SDK]].

The authentication section distinguishes between OAuth authentication (intended exclusively for purchasers of subscription plans for ordinary use of [[Claude Code]] and native [[Anthropic]] applications) and API key authentication (intended for developers building products or services, including those using the [[Agent SDK]]). The document explicitly prohibits third-party developers from offering Claude.ai login or routing requests through Free, Pro, or Max plan credentials on behalf of their users. [[Anthropic]] reserves the right to enforce these restrictions without prior notice.

Security information references the [[Anthropic]] Trust Center and Transparency Hub, and security vulnerability reporting is managed through HackerOne.

## Key Topics
- Commercial Terms vs Consumer Terms of Service for different plan types
- Existing commercial agreements extend to [[Claude Code]] usage
- BAA coverage requires both executed BAA and [[Zero Data Retention]] activation
- Per-organization ZDR requirement for healthcare compliance
- [[Anthropic]] Usage Policy applicability
- OAuth authentication for subscription plan users only
- API key authentication required for [[Agent SDK]] and third-party development
- Prohibition on third-party routing through subscription credentials
- Security vulnerability reporting via HackerOne
- [[Anthropic]] Trust Center and Transparency Hub
