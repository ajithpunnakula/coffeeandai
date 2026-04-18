---
title: "Source - Context Management & Reliability"
type: source
date: 2026-04-17
source_file: "raw/context-management-reliability.md"
tags: [context-window, reliability, certification, exam-prep, escalation, provenance]
---

This source from Claude Certifications covers Domain 5 of the Claude Certified Architect Foundations exam, addressing context management and reliability in production systems. It accounts for approximately 15% of the exam and is organized into four sections: context optimization and positioning, escalation and error propagation, context degradation and extended sessions, and human review with information provenance.

The context optimization section focuses on two key concepts: progressive summarization risks and the "lost in the middle" effect. Progressive summarization silently destroys critical details through repeated compression -- customer names, account numbers, exact amounts, and other specifics are lost across rounds. The recommended solution is immutable "case facts" blocks placed at the beginning of context (a high-recall position) that are never summarized or compressed. Research shows information in the middle of long contexts is less likely to be recalled, so position-aware ordering places the most important information at the beginning and end.

The escalation and error propagation section defines valid escalation triggers: explicit customer requests for a human, policy gaps, capability limits, business threshold exceedances (enforced by [[Hooks]]), and repeated failures after recovery attempts. Sentiment-based and confidence-based escalation are always wrong on the exam. For error propagation in multi-agent systems with [[Subagents]], the document stresses distinguishing access failures ("couldn't check") from genuinely empty results ("checked, found nothing"), and never silently dropping subagent failures.

Context degradation in long-running sessions is addressed with four mitigation strategies: `/compact` to compress conversation history and reclaim [[Context Window]] space, scratchpad files to persist critical intermediate state across context resets, [[Subagents]] delegation to keep verbose exploration out of coordinator context, and position-aware context ordering. The document also covers stratified metrics, warning that aggregate accuracy metrics can mask per-category failures (e.g., invoices at 70% while receipts at 99% still averaging 95%).

The human review and provenance section covers tracking data origin with metadata including source, confidence level (verified, extracted, inferred, estimated), timestamp, and agent ID. When [[Subagents]] provide conflicting information, provenance metadata enables informed conflict resolution. The section also covers stratified sampling for human review, field-level confidence indicators, claim-source mappings for traceability, temporal data preservation, and explicit conflict annotation rather than silent resolution.

## Key Topics
- Progressive summarization risks and immutable "case facts" blocks
- "Lost in the middle" effect and position-aware context ordering
- Valid escalation triggers vs anti-patterns (sentiment, confidence)
- Distinguishing access failures from genuinely empty results
- [[Context Window]] degradation mitigation: `/compact`, scratchpad files, [[Subagents]] delegation
- Stratified per-document-type accuracy metrics vs aggregate metrics
- Information provenance: source, confidence, timestamp, agent ID tracking
- Claim-source mappings for traceability and audit trails
- Conflict annotation rather than silent resolution
- Human-in-the-loop checkpoints for critical decisions
