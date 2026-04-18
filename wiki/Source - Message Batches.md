---
title: "Source - Message Batches"
type: source
date: 2026-04-17
source_file: "raw/message-batches.md"
tags: [api, batch-processing, cost-optimization]
---

This source is [[Anthropic]]'s official documentation page for the [[Message Batches]] API. However, the raw content captured only contains the page metadata and a "Loading..." placeholder, indicating the page content was not successfully fetched during clipping. The page is sourced from the Anthropic docs at the batch processing/message-batches endpoint.

Based on references to the Message Batches API across other exam preparation sources, this feature allows processing multiple API requests in batch with a 50% cost reduction compared to synchronous requests, with a 24-hour processing window. It is recommended for latency-tolerant workloads such as nightly code audits, weekly compliance scans, and other non-urgent bulk processing tasks. Synchronous requests remain appropriate for blocking tasks like PR reviews and real-time feedback.

## Key Topics

- [[Message Batches]] API for batch processing of Claude API requests
- 50% cost savings compared to synchronous requests
- 24-hour processing window for batch jobs
- Recommended for latency-tolerant, non-urgent workloads
- Synchronous processing preferred for blocking and real-time tasks
- Part of [[Anthropic]]'s API cost optimization toolkit
