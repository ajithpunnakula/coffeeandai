---
title: "Context Management & Reliability"
source: "https://claudecertifications.com/claude-certified-architect/domains/context-management"
author: ""
published: 
created: 2026-04-17
description: ""

tags:
  - "clippings"
---

[Skip to content](#main-content)

[Claude Certifications](/)

[Certified Architect](/claude-certified-architect)[Claude 101](/courses/claude-101)[Claude Code](/courses/claude-code-in-action)[AI Fluency](/courses/ai-fluency-foundations)[Videos](/videos)[Practice](/claude-certified-architect/practice-questions)[Exam Guide](/claude-certified-architect/exam-guide)[Register for Exam](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)[Domains](/claude-certified-architect/domains)Domain 5: Context & Reliability

Domain 5 · ~15%

# Context Management & Reliability

Manage context effectively in production systems. Covers progressive summarization risks, context positioning, escalation patterns, error propagation, context degradation, human review, and information provenance.

## In This Domain

[d5.1Context Optimization & Positioning](#d5.1)[d5.2Escalation & Error Propagation](#d5.2)[d5.3Context Degradation & Extended Sessions](#d5.3)[d5.4Human Review & Information Provenance](#d5.4)

d5.1

## Context Optimization & Positioning

Optimize context window usage with strategic positioning, trimming, and summarization techniques while avoiding common pitfalls.

### Context management techniques:

Progressive summarization risks: important details can be lost through repeated summarization

'Lost in the middle' effect: information in the middle of long contexts is less likely to be recalled

'Case facts' blocks: structured reference sections that preserve critical information

Trimming verbose tool outputs: remove noise while retaining essential data

Position-aware ordering: put the most important information at the beginning and end of context

### Anti-Patterns to Avoid

Progressive summarization of critical details without preserving originals

Ignoring the 'lost in the middle' effect in long context windows

Deep Dive — Detailed Explanation, Code & Comparisons

Context management is about making the most of the limited context window while preserving critical information. Two key concepts dominate this domain:

**1. Progressive Summarization Risks**

Progressive summarization compresses conversation history to save space. While it seems efficient, it silently destroys critical details:

Original: "Customer John Smith (ACC-12345) called about order #98765. Charged $150.00 instead of promotional $99.99."

After 1st summary: "Customer called about billing issue with promotion."

After 2nd summary: "Customer has a billing issue."

The customer name, account number, order number, exact amounts, and promotion code — all lost.

**2. The "Lost in the Middle" Effect**

Research shows that information in the **middle** of long contexts is less likely to be recalled by the model. Information at the beginning and end gets more attention.

**The solution: "Case Facts" blocks**

Instead of summarizing, preserve critical information in an immutable structured block placed at the beginning of context (high-recall position). This block is never summarized or compressed and contains all essential reference data.

Code Example

case-facts.md — Immutable Reference Block

```
1## CASE FACTS (Do not summarize — reference directly)

2

3| Field          | Value                                    |

4|----------------|------------------------------------------|

5| Customer       | John Smith                               |

6| Account ID     | ACC-12345                                |

7| Order          | #98765                                   |

8| Expected Price | $99.99 (promotion SUMMER2026)            |

9| Charged Price  | $150.00                                  |

10| Overcharge     | $50.01                                   |

11| Customer Since | 2019 (7-year tenure)                     |

12| Priority       | High (long-term customer + overcharge)   |

13

14## RULES

15- Always address customer as "Mr. Smith"

16- This case qualifies for immediate resolution

17- Refund amount ($50.01) is within $500 agent limit
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Progressive summarization loses critical details
Turn 1: "John Smith (ACC-12345) order #98765..."
Turn 5: [Summary] "Customer billing issue"
Turn 10: [Summary] "Billing issue being handled"
# By turn 10: lost name, account, order, amounts
```

✓Correct

```
# Case facts block — always available, never summarized
## CASE FACTS (immutable)
- Customer: John Smith (ACC-12345)
- Order: #98765
- Issue: Overcharged $50.01 (promo SUMMER2026)
# This block stays intact regardless of length
```

🎯Exam Tip

If the exam asks how to preserve critical customer details in a long conversation, the answer is ALWAYS 'case facts' blocks, never progressive summarization.

d5.2

## Escalation & Error Propagation

Design escalation patterns and error propagation strategies that provide enough context for recovery or human intervention.

### Escalation and error handling:

Escalation triggers: customer demands, policy gaps — not just sentiment

Structured error context vs generic errors: always include what was attempted

Access failures vs empty results: distinguish between 'could not check' and 'checked and found nothing'

Local recovery before coordinator escalation: try to fix locally first

Partial results + what was attempted: always report progress even on failure

### Anti-Patterns to Avoid

Sentiment-based escalation (sentiment does not equal task complexity)

Generic error propagation that loses the original error context

Silently suppressing errors instead of escalating with context

Deep Dive — Detailed Explanation, Code & Comparisons

Escalation and error propagation patterns determine how failures flow through a system. Getting this wrong means either overwhelming humans with trivial issues or silently dropping critical failures.

**Valid escalation triggers:**

•- Customer explicitly requests a human agent

•- Policy gap detected (situation not covered by existing rules)

•- Task exceeds agent capabilities (needs access the agent doesn't have)

•- Business threshold exceeded (e.g., refund > $500, handled by hooks)

•- Repeated failures after reasonable recovery attempts

**Invalid escalation triggers (exam anti-patterns):**

•- **Negative sentiment** — An angry customer with a simple address change should NOT be escalated. Sentiment does not equal task complexity.

•- **Self-reported confidence** — The model's own confidence assessment is unreliable.

**Error propagation in multi-agent systems:**

When a subagent fails, it must report structured context to the coordinator:

•- What was attempted

•- What error occurred (with category and retryability)

•- Whether the failure is an "access failure" (couldn't check) or "empty result" (checked, found nothing)

•- The coordinator then decides: retry, use alternative, or escalate

**Never silently drop subagent failures.** If a subagent can't access a database, the coordinator must know the data is missing — not assume the query returned nothing.

Code Example

escalation-logic.py — Structured Escalation

```
1def should_escalate(context):

2    """Determine if we need human intervention."""

3

4    # VALID escalation triggers

5    if context.customer_requested_human:

6        return True, "Customer explicitly requested human agent"

7

8    if context.policy_gap_detected:

9        return True, "No policy covers this situation"

10

11    if context.amount > AGENT_REFUND_LIMIT:

12        return True, f"Amount {context.amount} exceeds limit"

13

14    if context.retry_count >= MAX_RETRIES:

15        return True, "Exhausted retry attempts"

16

17    # INVALID triggers — DO NOT use these

18    # if context.sentiment == "negative":  # WRONG!

19    #     return True  # Sentiment != complexity

20

21    # if context.model_confidence < 0.7:  # WRONG!

22    #     return True  # Self-reported confidence unreliable

23

24    return False, None
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Escalate based on sentiment (WRONG)
if customer_sentiment == "angry":
    escalate_to_human()
# An angry customer asking to change their
# address does NOT need a human agent

# Escalate based on confidence (WRONG)
if model_confidence < 0.7:
    escalate_to_human()
# Model self-reported confidence is unreliable
```

✓Correct

```
# Escalate based on objective criteria (RIGHT)
if customer.requested_human:
    escalate("Customer requested human")
if not policy_covers(situation):
    escalate("Policy gap detected")
if refund_amount > AGENT_LIMIT:
    escalate(f"Amount exceeds {AGENT_LIMIT} limit")
```

🎯Exam Tip

Sentiment-based and confidence-based escalation are ALWAYS wrong on the exam. Valid triggers are: explicit customer request, policy gaps, capability limits, and business thresholds.

d5.3

## Context Degradation & Extended Sessions

Handle context degradation in long-running sessions. Use scratchpad files, /compact, and subagent delegation to maintain quality.

### Managing extended sessions:

Context degradation: quality decreases in extended sessions as context fills up

Scratchpad files: external files to persist important state across context resets

/compact: compress conversation history to reclaim context space

Subagent delegation: delegate verbose exploration to subagents to keep coordinator context clean

Crash recovery manifests: persistent state files that enable session recovery

### Anti-Patterns to Avoid

Running extended sessions without monitoring context degradation

Not using scratchpad files for important intermediate state

Deep Dive — Detailed Explanation, Code & Comparisons

Long-running agent sessions suffer from **context degradation** — the quality of responses decreases as the conversation grows longer and the context window fills up.

**Symptoms of context degradation:**

•- Agent forgets earlier instructions or constraints

•- Responses become less focused and more generic

•- Tool selection accuracy decreases

•- The agent may repeat work it already did

**Mitigation strategies (exam favorites):**

1.1. **/compact** — Compress conversation history to reclaim context space. Use when the context is getting long but the task isn't done yet.

2.2. **Scratchpad files** — Persist critical intermediate state to external files. These survive context compression and session boundaries.

3.3. **Subagent delegation** — Delegate verbose exploration tasks to subagents. The subagent's context absorbs the exploration noise, and only the synthesized results come back to the coordinator.

4.4. **Position-aware context ordering** — Place the most important information at the beginning and end of context (high-recall positions). Less critical information goes in the middle.

**Stratified metrics (per-document-type tracking):**

Aggregate accuracy metrics can mask per-category failures. If invoices have 70% accuracy while receipts have 99%, the aggregate might still show 95%. Track accuracy per document type to reveal hidden failures.

**Information provenance:**

Always preserve the source and confidence level of information. Track where each piece of data came from and how reliable the source is. This enables the coordinator to make informed decisions about conflicting information.

Code Example

context-management.py — Degradation Mitigation

```
1# Strategy 1: Scratchpad files for persistent state

2agent.run("""

3Before starting complex analysis:

41. Create a scratchpad file: progress.md

52. Record key findings as you discover them

63. Update progress.md after each major step

74. If context gets long, use /compact

85. After /compact, re-read progress.md to restore context

9""")

10

11# Strategy 2: Subagent delegation for verbose tasks

12coordinator = Agent(tools=[Task, read_scratchpad, summarize])

13coordinator.run("""

14For this codebase analysis:

151. Delegate file-by-file analysis to a subagent

16   (keeps verbose exploration out of coordinator context)

172. Subagent writes findings to scratchpad files

183. Coordinator reads summarized findings

194. Coordinator synthesizes final report

20""")

21

22# Strategy 3: Stratified metrics

23def track_accuracy(results):

24    """Track per-document-type, not just aggregate."""

25    by_type = {}

26    for r in results:

27        doc_type = r["document_type"]

28        if doc_type not in by_type:

29            by_type[doc_type] = {"correct": 0, "total": 0}

30        by_type[doc_type]["total"] += 1

31        if r["is_correct"]:

32            by_type[doc_type]["correct"] += 1

33

34    # This reveals hidden failures per category

35    for doc_type, stats in by_type.items():

36        accuracy = stats["correct"] / stats["total"] * 100

37        print(f"{doc_type}: {accuracy:.1f}%")
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Aggregate metrics only (masks failures)
total_correct = 950
total_processed = 1000
accuracy = 95.0%  # "Looks great!"

# But actually:
# Invoices:  70/100  = 70% (FAILING!)
# Receipts:  880/900 = 97.8%
# The aggregate HIDES the invoice problem
```

✓Correct

```
# Per-document-type metrics (reveals failures)
Invoice accuracy:  70.0%  # ALERT: Below threshold!
Receipt accuracy:  97.8%  # OK
Contract accuracy: 100.0% # OK
# Now we can see and fix the invoice problem
```

🎯Exam Tip

Aggregate metrics masking per-category failures is a KEY exam concept. The correct answer always tracks accuracy per document type (stratified metrics), not just overall accuracy.

d5.4

## Human Review & Information Provenance

Design human-in-the-loop review systems and maintain information provenance through claim-source mappings and temporal data.

### Human review and provenance:

Stratified sampling: review samples across different categories, not just random selection

Field-level confidence: provide confidence indicators for individual data fields

Accuracy by document type: track performance per document category, not just aggregate

Claim-source mappings: link each output claim to its source for traceability

Temporal data: preserve timestamps and version information for currency

Conflict annotation: explicitly mark conflicting sources rather than silently choosing one

### Anti-Patterns to Avoid

Aggregate accuracy metrics that mask per-document-type failures

Not maintaining claim-source mappings for traceability

Silently resolving source conflicts instead of annotating them

Deep Dive — Detailed Explanation, Code & Comparisons

**Information provenance** means tracking where each piece of data came from and how reliable the source is. This is critical for multi-agent systems where different subagents contribute information from different sources.

**Why provenance matters:**

•- When two subagents provide conflicting information, the coordinator needs to know which source is more reliable

•- Audit trails require knowing which data came from which source

•- Downstream decisions depend on data quality — a number from a verified database is more reliable than one extracted from a PDF

**Provenance metadata to track:**

•- **Source**: Where did this data come from? (API, database, document, web)

•- **Confidence**: How reliable is this source? (verified, extracted, inferred, estimated)

•- **Timestamp**: When was this data retrieved?

•- **Agent**: Which subagent provided this data?

**Human-in-the-loop checkpoints:**

For critical decisions, the system should pause and present the human with:

•- The decision to be made

•- The data supporting each option (with provenance)

•- The recommended action and why

•- A way to approve, modify, or reject

This is especially important for:

•- Financial decisions above certain thresholds

•- Legal or compliance-sensitive operations

•- Irreversible actions (deleting data, sending external communications)

•- Cases where the agent detected ambiguity or conflicting information

Code Example

provenance.py — Information Source Tracking

```
1from dataclasses import dataclass

2from datetime import datetime

3from typing import Literal

4

5@dataclass

6class DataWithProvenance:

7    value: str | float | dict

8    source: str                    # "customer-db", "invoice-pdf", "web"

9    confidence: Literal["verified", "extracted", "inferred", "estimated"]

10    retrieved_at: datetime

11    agent_id: str                  # Which subagent provided this

12

13def resolve_conflict(data_points: list[DataWithProvenance]):

14    """When subagents disagree, use provenance to decide."""

15

16    confidence_rank = {

17        "verified": 4,   # From authoritative source

18        "extracted": 3,  # Parsed from structured document

19        "inferred": 2,   # Derived from context

20        "estimated": 1,  # Best guess

21    }

22

23    # Pick the most reliable source

24    best = max(data_points, key=lambda d: confidence_rank[d.confidence])

25

26    # Log the conflict for audit trail

27    log_conflict(

28        chosen=best,

29        alternatives=data_points,

30        reason=f"Selected {best.source} (confidence: {best.confidence})"

31    )

32

33    return best
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# No provenance tracking
revenue = subagent_1.get_revenue()  # From where?
revenue_2 = subagent_2.get_revenue()  # Conflicts!
# Which one do we trust? We don't know!
final_revenue = revenue  # Arbitrary choice
```

✓Correct

```
# With provenance tracking
rev_1 = DataWithProvenance(
    value=1_500_000, source="financial-db",
    confidence="verified", agent_id="finance-agent")
rev_2 = DataWithProvenance(
    value=1_480_000, source="quarterly-pdf",
    confidence="extracted", agent_id="doc-agent")
# Trust the verified database over extracted PDF
final = resolve_conflict([rev_1, rev_2])
```

🎯Exam Tip

When subagents provide conflicting data, the correct answer always involves tracking information provenance (source, confidence, timestamp) and using it to resolve conflicts. Arbitrary selection without provenance is always wrong.

## Exam Tips for Domain 5

1.

Progressive summarization loses critical details — use 'case facts' blocks instead

2.

Sentiment ≠ complexity for escalation decisions

3.

Always distinguish access failures from genuinely empty results

4.

Track accuracy per document type, not just aggregate

## Related Exam Scenarios

[1

### Customer Support Resolution Agent

Design an AI-powered customer support agent that handles inquiries, resolves issues, and escalates complex cases. Tests Agent SDK usage, MCP tools, and escalation logic.](/claude-certified-architect/scenarios#scenario-1)[3

### Multi-Agent Research System

Build a coordinator-subagent system for parallel research tasks. Tests multi-agent orchestration, context passing, error propagation, and result synthesis.](/claude-certified-architect/scenarios#scenario-3)[6

### Structured Data Extraction

Build a structured data extraction pipeline from unstructured documents. Tests JSON schemas, tool\_use, validation-retry loops, and few-shot prompting.](/claude-certified-architect/scenarios#scenario-6)

## Test Your Knowledge of Context & Reliability

Practice with scenario-based questions covering this domain.

[Practice Questions](/claude-certified-architect/practice-questions)

[Previous Domain

Prompt Engineering](/claude-certified-architect/domains/prompt-engineering)[Next Step

View Study Guide](/claude-certified-architect/study-guide)

[Claude Certifications](/)

Free courses, study guides, and certification prep for Claude and agentic AI development. Learn at your own pace with hands-on lessons and practice quizzes.

### Courses

* [All Courses](/courses)
* [Claude 101](/courses/claude-101)
* [What Is Claude?](/courses/claude-101/what-is-claude)
* [Claude Projects](/courses/claude-101/introduction-to-projects)
* [Claude Code in Action](/courses/claude-code-in-action)
* [MCP Servers Guide](/courses/claude-code-in-action/mcp-servers)
* [Video Tutorials](/videos)

### Architect Certification

* [12-Week Study Plan](/claude-certified-architect/study-guide)
* [Exam Domains](/claude-certified-architect/domains)
* [Practice Questions](/claude-certified-architect/practice-questions)
* [Exam Guide](/claude-certified-architect/exam-guide)
* [Anti-Patterns](/claude-certified-architect/anti-patterns)
* [FAQ](/claude-certified-architect/faq)

### Quick Links

* [Browse All Courses](/courses)
* [Architect Cert Overview](/claude-certified-architect)
* [Disclaimer & Sources](/disclaimer)

© 2026 claudecertifications.com. All trademarks belong to their respective owners.

Built for the Claude architect community
