---
id: card_5c9e2a4b
type: quiz
order: 4
difficulty: 1
title: "Check Your Understanding: Agentic Loop"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Agentic Loop"]
pass_threshold: 0.8
questions:
  - prompt: "In a Claude agentic loop, what controls whether the loop continues or terminates?"
    objective: "Identify stop_reason as the only reliable loop termination signal"
    source: "raw/agentic-architecture-orchestration.md"
    choices:
      - text: "The stop_reason field in the API response ('tool_use' to continue, 'end_turn' to stop)"
        correct: true
      - text: "Parsing the assistant's text output for phrases like 'task complete' or 'I'm done'"
        correct: false
        misconception: "Text content is for the user, not control flow. The model may phrase completion differently each time, making text parsing unreliable."
      - text: "An iteration counter that stops the loop after a fixed number of cycles"
        correct: false
        misconception: "Iteration caps are arbitrary and do not reflect actual task completion. They may cut off mid-task or allow pointless looping."
      - text: "Monitoring cumulative token usage and stopping when a threshold is reached"
        correct: false
        misconception: "Token consumption has no relationship to task completion. A task may finish early or require many tokens regardless of a budget threshold."
  - prompt: "What does a stop_reason value of 'end_turn' indicate in the agentic loop?"
    objective: "Understand the meaning of end_turn and the correct response"
    source: "raw/agentic-architecture-orchestration.md"
    choices:
      - text: "Claude has finished its work and the loop should exit, returning the final response"
        correct: true
      - text: "An error occurred and the loop should retry the last request"
        correct: false
        misconception: "end_turn is a normal completion signal, not an error. Errors are handled separately through error response codes."
      - text: "Claude has exhausted its available tools and cannot continue"
        correct: false
        misconception: "Tool exhaustion is not signaled by end_turn. If Claude needs a tool it does not have, it will respond with text explaining the limitation."
      - text: "The maximum number of tool calls has been reached for this session"
        correct: false
        misconception: "There is no built-in tool call limit signaled by end_turn. The model decides when it is done based on task state, not tool call counts."
  - prompt: "Why is parsing natural language output (e.g., checking for 'I'm done') an unreliable method for determining when to exit the agentic loop?"
    objective: "Understand why text parsing fails as a control flow mechanism"
    source: "raw/agentic-architecture-orchestration.md"
    choices:
      - text: "Text content is meant for the user, not control flow, and the model may phrase completion differently each time"
        correct: true
      - text: "Parsing text adds too much latency to each loop iteration"
        correct: false
        misconception: "The issue is reliability, not performance. Text parsing is fast but fundamentally unreliable because phrasing varies unpredictably."
      - text: "It increases API costs because you need to read the full response text"
        correct: false
        misconception: "Cost is not the concern. You already receive the full response text. The issue is that no set of string patterns can reliably detect all completion phrasings."
      - text: "Natural language parsing requires an additional NLP model to interpret correctly"
        correct: false
        misconception: "Adding another model does not solve the fundamental problem. The correct approach is to use the structured stop_reason field, which is deterministic."
---
