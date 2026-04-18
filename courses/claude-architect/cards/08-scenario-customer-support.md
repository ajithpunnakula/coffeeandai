---
id: card_6d9b2c7f
type: scenario
order: 8
difficulty: 3
title: "Scenario: Customer Support Resolution Agent"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Hooks", "Agentic Loop", "Agent SDK"]
source: "raw/6-exam-scenarios-deep-dive.md"
steps:
  - id: start
    situation: "A customer contacts support reporting they were charged twice for a $450 order. You are designing the support agent architecture. The agent needs to look up the order, verify the duplicate charge, and potentially process a refund. How do you enforce the company's $500 refund limit?"
    choices:
      - text: "Implement a PostToolUse hook on the refund tool that programmatically blocks any refund above $500 and automatically escalates to a human agent"
        next: hook_path
        score: 3
      - text: "Add a clear instruction to the system prompt: 'Never process refunds exceeding $500. Always escalate amounts above this threshold.'"
        next: prompt_path
        score: 0
      - text: "Let the agent decide based on the conversation context whether the refund amount is appropriate to process"
        next: prompt_path
        score: 0
  - id: hook_path
    situation: "Good choice. The PostToolUse hook is in place. During testing, a different customer requests a $600 refund and the hook correctly blocks it, returning an escalation signal. Now, the original customer (with the $450 duplicate charge) has been refunded successfully but becomes frustrated with the wait time and says: 'I want to talk to a manager right now.' What triggers the escalation?"
    choices:
      - text: "The customer's explicit request to speak with a human agent -- this is a valid, objective escalation trigger"
        next: escalation_right
        score: 3
      - text: "Sentiment analysis detecting frustration in the customer's messages"
        next: end_bad_escalation
        score: 0
      - text: "The model's self-assessed confidence score dropping below a threshold"
        next: end_bad_escalation
        score: 0
  - id: prompt_path
    situation: "The agent is deployed with the refund limit in the system prompt. A week later, a customer requests a $700 refund for a defective bulk order. Despite the prompt instruction, the agent processes the full $700 refund without hesitation. The $500 limit was violated. What went wrong?"
    choices:
      - text: "Prompts are probabilistic -- the model can and will sometimes ignore instructions. Critical business rules require deterministic enforcement through programmatic hooks."
        next: prompt_path_redirect
        score: 2
      - text: "The system prompt was not emphatic enough. Adding 'CRITICAL' and 'MUST NOT' would have prevented this."
        next: end_prompt_fail
        score: 0
      - text: "The model ran out of context window space and lost the instruction."
        next: end_prompt_fail
        score: 0
  - id: prompt_path_redirect
    situation: "Correct -- you recognize the fundamental problem. You redesign the system with a PostToolUse hook that blocks refunds above $500. The hook catches a $600 attempt and escalates properly. Now a customer explicitly asks to speak with a manager. What should trigger the escalation?"
    choices:
      - text: "The customer's explicit request -- this is an objective, valid escalation trigger"
        next: escalation_right
        score: 3
      - text: "Run sentiment analysis on the conversation to confirm the customer is truly upset"
        next: end_bad_escalation
        score: 0
      - text: "Check the model's confidence score to see if it agrees escalation is needed"
        next: end_bad_escalation
        score: 0
  - id: escalation_right
    situation: "The agent correctly escalates based on the customer's explicit request. A human agent is now joining the conversation. How should the case context be preserved and handed off to the human agent?"
    choices:
      - text: "Provide an immutable 'case facts' block containing the customer name, account ID, order number, amounts, and actions already taken"
        next: end_proper
        score: 3
      - text: "Use progressive summarization to condense the conversation into a brief summary for the human agent"
        next: end_context_loss
        score: 1
      - text: "Pass the full raw conversation history to the human agent so nothing is missed"
        next: end_context_loss
        score: 1
  - id: end_proper
    outcome: "Excellent architectural design. You enforced the $500 refund limit with a deterministic PostToolUse hook (not a prompt), triggered escalation based on an objective signal (explicit customer request), and preserved case context with an immutable facts block. This is the exam-correct approach: hooks for compliance, objective triggers for escalation, structured data for handoff."
    total_score: "9/9"
  - id: end_prompt_fail
    outcome: "The business rule was violated because prompts are probabilistic. No matter how strongly worded, a system prompt instruction cannot guarantee compliance. The correct approach is a PostToolUse hook that programmatically blocks refund tool calls exceeding $500. This is one of the most critical anti-patterns on the exam."
    total_score: "0/9"
  - id: end_bad_escalation
    outcome: "Escalation was triggered on an invalid signal. Sentiment analysis and model self-reported confidence are both documented anti-patterns. Sentiment does not equal task complexity -- an angry customer with a simple request does not need a human. Model confidence scores are not well-calibrated for production decisions. Valid triggers are: explicit customer request, policy gaps, capability limits, and business thresholds."
    total_score: "3/9"
  - id: end_context_loss
    outcome: "The handoff lost critical details. Progressive summarization silently drops specifics like exact dollar amounts, order numbers, and actions already taken. A full conversation dump overwhelms the human agent. The correct approach is an immutable 'case facts' block with structured data: customer name, account ID, order number, charge amounts, and a log of actions the agent already performed."
    total_score: "7/9"
---
