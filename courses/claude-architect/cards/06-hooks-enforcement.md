---
id: card_8b2c6d4e
type: page
order: 6
difficulty: 2
title: "Hooks and Programmatic Enforcement"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Hooks", "Agentic Loop"]
source: "raw/agentic-architecture-orchestration.md"
speaker_notes: "This is the second most critical concept in Domain 1 after the agentic loop itself. The key exam insight: hooks are deterministic (100% reliable), prompts are probabilistic (the model CAN and WILL sometimes ignore them). Any time a business rule is critical -- financial limits, compliance, security -- the answer is hooks, never prompts."
content_hashes:
  "Hooks": "b8c9d0e1"
  "Agentic Loop": "f2a3b4c5"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_8b2c6d4e-lHO0Qauv6eesSJPPMYDDdtgoUubatp.mp3"
---

# Hooks and Programmatic Enforcement

[[Hooks]] provide **deterministic, programmatic enforcement** of business rules within the [[Agentic Loop]]. They intercept tool calls before or after execution, allowing you to block, modify, or augment behavior with 100% reliability.

## The Critical Distinction

This is the most important distinction the exam tests in the hooks domain:

| | Hooks | Prompts |
|---|---|---|
| **Nature** | Deterministic (code) | Probabilistic (suggestions) |
| **Reliability** | 100% -- hooks run as code, not suggestions | Model **can and will** sometimes ignore instructions |
| **Use for** | Critical business rules, compliance, security | Style preferences, soft guidelines, tone |

**Example**: A $500 refund limit is a critical business rule. If you put "never process refunds above $500" in a system prompt, the model might process a $700 refund anyway. A PostToolUse hook **guarantees** the block.

## Types of Hooks

**PreToolUse** -- Intercepts **before** tool execution:
- Block tool calls that violate policy
- Modify parameters before execution
- Add validation checks

**PostToolUse** -- Intercepts **after** tool execution:
- Modify or normalize tool output
- Trigger side effects (logging, alerts)
- Block results that exceed thresholds and redirect to escalation

## Hook-Based Refund Enforcement

```python
def refund_limit_hook(tool_name, tool_input, tool_output):
    if tool_name == "process_refund":
        amount = tool_input.get("amount", 0)
        if amount > 500:
            return {
                "blocked": True,
                "reason": f"Refund ${amount} exceeds $500 limit",
                "action": "escalate_to_human",
                "context": {
                    "customer_id": tool_input.get("customer_id"),
                    "requested_amount": amount,
                    "agent_limit": 500,
                }
            }
    return tool_output  # Allow all other tool calls

agent = Agent(
    model="claude-sonnet-4-20250514",
    tools=[lookup_customer, check_order, process_refund],
    hooks={"PostToolUse": [refund_limit_hook]},
)
```

## Valid vs Invalid Escalation Triggers

The exam frequently tests whether you can distinguish valid from invalid escalation triggers:

**Valid (objective criteria):**
- Customer explicitly requests a human agent
- Policy gap detected -- no existing rule covers the situation
- Task exceeds agent capabilities (e.g., requires access to a system the agent cannot reach)
- Business threshold exceeded (e.g., refund amount > $500)

**Invalid (anti-patterns):**
- Negative sentiment detected -- an angry customer with a simple request does NOT need a human. Sentiment does not equal task complexity.
- Model self-reports low confidence -- model confidence scores are not well-calibrated and cannot be relied upon for production decisions.
- Conversation is "too long" -- length alone does not indicate the need for human intervention.

## Exam Tip

Every question about enforcing critical business rules has the same answer: **programmatic hooks**. Every question about escalation will include at least one sentiment-based distractor. Eliminate it immediately.
