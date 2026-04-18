---
id: card_4f1e8a3c
type: quiz
order: 7
difficulty: 2
title: "Quiz: Multi-Agent Systems and Hooks"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Subagents", "Hooks"]
pass_threshold: 0.8
questions:
  - prompt: "In a hub-and-spoke multi-agent architecture, what context should each subagent receive when the coordinator delegates a task?"
    objective: "Understand context isolation in multi-agent systems"
    source: "raw/agentic-architecture-orchestration.md"
    choices:
      - text: "Only the context specific to that subagent's assigned subtask, with a focused prompt and relevant data"
        correct: true
      - text: "The full coordinator conversation history so the subagent has complete awareness"
        correct: false
        misconception: "Sharing full coordinator context is a documented anti-pattern. It wastes tokens, confuses the subagent with irrelevant information, and pollutes its context window."
      - text: "A shared global state object that all subagents read from and write to"
        correct: false
        misconception: "Subagents operate in isolation by design. Shared mutable state breaks context isolation and creates unpredictable interactions between subagents."
      - text: "No context at all -- subagents should discover what they need through their own tool calls"
        correct: false
        misconception: "Subagents need explicit context to perform their task effectively. Without context, they waste cycles rediscovering information the coordinator already has."
  - prompt: "A customer support agent must enforce a strict $500 refund limit. How should this business rule be implemented?"
    objective: "Distinguish hook-based enforcement from prompt-based enforcement"
    source: "raw/anti-patterns-cheatsheet.md"
    choices:
      - text: "A PostToolUse hook that programmatically blocks refund tool calls above $500 and triggers escalation"
        correct: true
      - text: "Add 'never process refunds above $500' to the system prompt as a clear instruction"
        correct: false
        misconception: "Prompts are probabilistic. The model can and will sometimes ignore critical instructions, making prompt-based enforcement unreliable for business rules."
      - text: "Ask the model to check the amount before calling the refund tool and refuse if it exceeds $500"
        correct: false
        misconception: "This is still prompt-based enforcement. Asking the model to self-police is probabilistic and provides no guarantee that the limit will be respected."
      - text: "Implement a retry loop that re-prompts the model if it attempts a refund over $500"
        correct: false
        misconception: "A retry loop still relies on the model eventually complying with instructions. It adds latency without providing deterministic enforcement."
  - prompt: "Which of the following is a VALID trigger for escalating a customer support case to a human agent?"
    objective: "Identify valid escalation triggers based on objective criteria"
    source: "raw/agentic-architecture-orchestration.md"
    choices:
      - text: "The customer explicitly requests to speak with a human agent"
        correct: true
      - text: "Sentiment analysis detects that the customer is frustrated or angry"
        correct: false
        misconception: "An angry customer with a simple request does not need a human. Sentiment does not equal task complexity or the need for escalation."
      - text: "The model reports low confidence in its ability to handle the request"
        correct: false
        misconception: "Model self-reported confidence scores are not well-calibrated and cannot be relied upon for production escalation decisions."
      - text: "The conversation has exceeded a certain number of turns, suggesting the issue is complex"
        correct: false
        misconception: "Conversation length does not indicate complexity. Some simple issues take several turns to resolve, while complex issues may be identified in one turn."
---
