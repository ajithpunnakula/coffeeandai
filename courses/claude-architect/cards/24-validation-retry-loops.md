---
id: card_e7c2a4d6
type: page
order: 24
difficulty: 3
title: "Validation-Retry Loops and Multi-Pass Review"
domain: "Prompt Engineering & Structured Output"
wiki_refs: ["Structured Output", "Agentic Loop"]
source: "raw/prompt-engineering-structured-output.md"
content_hashes:
  "Structured Output": "c5d38e64"
  "Agentic Loop": "f9a27b01"
speaker_notes: |
  This card covers the validation-retry pattern and multi-pass review, both of which are common exam topics at the higher difficulty level. Start with the core pattern: extract, validate, append specific errors, retry. Emphasize the word SPECIFIC -- show the difference between "there were errors, try again" (useless) and "invoice_date format invalid: got '03/15/2026', expected ISO 8601" (actionable). The model needs signal about what went wrong to fix it. Then cover multi-pass review: Pass 1 does per-file local analysis, Pass 2 does cross-file integration. This separation prevents the model from getting overwhelmed trying to do everything at once. Address the self-review anti-pattern: reviewing in the same session inherits the generator's blind spots. A separate session with a review-focused prompt catches more issues. End with the Batch API mention -- 50% cost savings for non-urgent tasks is a concrete optimization students should remember.
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_e7c2a4d6-AcMCWJThQTBy3hU3VkUqwvUQryFROM.mp3"
---

# Validation-Retry Loops and Multi-Pass Review

When Claude generates structured output or performs analytical tasks, the first attempt is rarely perfect. Production systems need systematic approaches to catch and correct errors rather than hoping for perfection on the first try.

## The Validation-Retry Pattern

The core loop is: **extract -> validate -> append SPECIFIC errors -> retry**.

```
1. Claude generates output (extraction, analysis, etc.)
2. Your code validates the output against business rules
3. If validation fails, append SPECIFIC error details to the conversation
4. Claude retries with knowledge of exactly what went wrong
```

The critical word is **specific**. The anti-pattern is sending a generic message like "there were errors, please try again." This gives the model zero signal about what to fix, and it will likely produce the same errors or introduce new ones.

### Specific vs. Generic Error Feedback

| Generic (anti-pattern) | Specific (correct) |
|---|---|
| "There were errors, try again" | "invoice_date format invalid: got '03/15/2026', expected ISO 8601 (YYYY-MM-DD)" |
| "Some fields are wrong" | "total_amount is 1,250.00 but line items sum to 1,350.00 -- discrepancy of 100.00" |
| "Fix the output" | "category field contains 'Electronics' which is not in the allowed enum: ['hardware', 'software', 'services']" |

Specific feedback tells the model **which field** failed, **what the actual value** was, **what was expected**, and **which rule was violated**. This enables targeted correction rather than guesswork.

## Multi-Pass Review

Complex analytical tasks benefit from splitting into separate passes:

- **Pass 1: Per-file local analysis.** Examine each file or document independently, extracting findings in isolation.
- **Pass 2: Cross-file integration.** Synthesize findings from Pass 1, identify patterns across files, resolve contradictions, and produce final output.

This separation prevents the model from being overwhelmed by trying to hold all context and perform all analysis simultaneously. Each pass has a focused objective and a manageable scope.

## The Self-Review Anti-Pattern

Asking Claude to review its own output **in the same session** is unreliable. The model inherits its own blind spots from the generation step -- the same reasoning that produced an error will often fail to catch it during review.

The fix is to use a **separate session** with a review-focused system prompt. The reviewer session has no memory of how the output was generated and approaches it with fresh perspective. This is analogous to code review by a different developer rather than self-review.

## Cost Optimization: Batch API

For validation-retry workflows on non-urgent tasks (nightly data processing, bulk extraction), the **Batch API saves 50% on cost**. You submit a batch of requests and receive results within 24 hours. The same validation-retry logic applies, but at half the per-token price.

**Exam tip:** When a scenario describes a pipeline that retries on error but keeps getting the same results, the answer is almost always that the error feedback is too generic. Specific error messages are the key to successful retry loops.
