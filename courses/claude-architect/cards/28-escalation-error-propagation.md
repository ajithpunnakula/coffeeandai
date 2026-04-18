---
id: card_a9d4c7f2
type: page
order: 28
difficulty: 3
title: "Escalation Patterns and Error Propagation"
domain: "Context Management & Reliability"
wiki_refs: ["Context Window", "Hooks", "Subagents"]
source: "raw/context-management-reliability.md"
content_hashes:
  Context Window: "a1b2c3d4"
  Hooks: "c9d0e1f2"
  Subagents: "b3c4d5e6"
speaker_notes: "This card covers two critical reliability topics that frequently appear on the architect exam: knowing when to escalate (and when NOT to), and preventing silent error propagation in multi-agent pipelines. The escalation section is about building judgment into the system — sentiment alone is never a valid escalation trigger. An angry customer with a simple password reset request does not need a human. The error propagation section is about information integrity in distributed systems. The key anti-pattern to hammer home is silent error suppression: when a subagent times out and returns an empty array, downstream agents interpret 'no data' as 'confirmed absence of data.' This is catastrophic in production. Also stress the difference between aggregate and stratified metrics — 95% overall accuracy can hide a 70% failure rate on an important category."
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_a9d4c7f2-r20uHWIHfq22lQGDkBwY48MREhLVRo.mp3"
---

## Escalation Patterns and Error Propagation

### Valid Escalation Triggers

Not every difficult interaction requires human intervention. A well-designed system should escalate based on **task characteristics**, not emotional signals. Valid triggers include:

- **Customer explicitly requests a human agent**
- **Policy gap detected** — the situation falls outside defined handling procedures
- **Task exceeds capability** — the agent cannot access required systems or perform needed actions
- **Business threshold exceeded** — transaction value, risk level, or compliance requirements demand human oversight
- **Repeated failures** — the agent has attempted resolution multiple times without success

### Invalid Escalation Triggers

Two common anti-patterns in escalation design:

1. **Sentiment alone**: An angry customer with a simple request (e.g., password reset) does NOT require escalation. Frustration about the channel ("I hate chatbots") is not the same as a task the agent cannot handle. Escalating based on sentiment leads to over-escalation, increased human workload, and often slower resolution for the customer.

2. **Self-reported model confidence**: Models are not well-calibrated at reporting their own confidence levels. "I'm 60% sure" from a model is not a reliable signal for escalation decisions. Use structured criteria instead.

### Error Propagation in Multi-Agent Systems

When [[Subagents]] operate in a pipeline, errors must propagate with full context. Every error should be a structured object containing:

- **What was attempted** — the specific task or query
- **Error category** — timeout, authentication failure, rate limit, data format error, etc.
- **Retryability** — whether the operation can be retried and under what conditions

#### The Silent Suppression Anti-Pattern

The most dangerous failure mode is **silent error suppression**. When a subagent times out and returns an empty array `[]`, downstream agents interpret this as "no results found" rather than "we couldn't check." In a research system, this means the final report states "no competitors exist" when the reality is "we failed to look."

**Access failure is NOT the same as an empty result.** These must be distinguishable in the system's data model.

### Stratified vs. Aggregate Metrics

Aggregate metrics hide category-specific failures. A system reporting "95% overall accuracy" might break down as:

| Document Type | Accuracy | Volume |
|---------------|----------|--------|
| Receipts      | 99.8%    | 8,000  |
| Invoices      | 70.0%    | 2,000  |
| **Overall**   | **95.0%**| 10,000 |

The 70% invoice accuracy is masked by the high-volume, easy-to-process receipts. **Always use stratified metrics** — break performance down by category, difficulty, and edge case frequency.

### Information Provenance

In multi-agent systems, every piece of data should carry provenance metadata. [[Hooks]] can be used to enforce provenance tagging at system boundaries. The confidence hierarchy is:

1. **Verified** — confirmed against authoritative source
2. **Extracted** — pulled directly from a document
3. **Inferred** — derived from available data
4. **Estimated** — approximated based on patterns

Each datum should also carry: source identifier, timestamp, and agent ID (which agent in the pipeline produced or transformed it).
