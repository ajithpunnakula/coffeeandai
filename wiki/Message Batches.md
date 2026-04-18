---
title: "Message Batches"
type: concept
tags: [api, optimization]
sources: ["raw/message-batches.md"]
---

# Message Batches

The Message Batches API is an [[Anthropic]] API feature for processing large volumes of Claude API requests asynchronously at 50% reduced cost compared to standard API calls. Batches are submitted as collections of message requests and processed within 24 hours, making them suitable for non-urgent, high-volume workloads.

Common use cases in the [[Claude Code]] ecosystem include nightly code audits, bulk documentation generation, and large-scale data processing pipelines. The [[Claude Certified Architect Exam]] tests knowledge of when to use Message Batches — specifically for non-urgent tasks where latency tolerance allows trading response time for cost savings.

Message Batches complement [[Prompt Caching]] as a cost optimization strategy: caching reduces per-request cost for repeated context, while batching reduces cost for high-volume throughput.

## See also

- [[Anthropic]], [[Prompt Caching]], [[Agent SDK]]
- [[Source - Message Batches]]
