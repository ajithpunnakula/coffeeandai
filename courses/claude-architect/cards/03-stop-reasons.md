---
id: card_3b8d1f5a
type: page
order: 3
difficulty: 1
title: "Stop Reasons and Loop Termination"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Agentic Loop", "Claude Code"]
source: "raw/agentic-architecture-orchestration.md"
speaker_notes: "This card hammers home the anti-patterns. The exam will always present 3-4 options for loop termination and the correct answer is ALWAYS checking stop_reason. Learners must be able to instantly recognize and eliminate the three common distractors: parsing text output, iteration caps, and token monitoring."
content_hashes:
  "Agentic Loop": "d4e5f6a7"
  "Claude Code": "b8c9d0e1"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_3b8d1f5a-mBLvtRWvDx2PgGxRDT9G1oSp4UEkUz.mp3"
---

# Stop Reasons and Loop Termination

Checking `stop_reason` is the **only reliable** way to determine whether the [[Agentic Loop]] should continue or terminate. This is one of the most heavily tested concepts on the exam.

## Why stop_reason Is the Only Reliable Signal

The `stop_reason` field is a **structured, deterministic** value returned by the API. It has exactly two relevant values for agentic loops:

- `"tool_use"` -- Claude needs to call a tool. Execute the tool and continue.
- `"end_turn"` -- Claude has decided its work is complete. Exit the loop.

The model itself decides when the task is done based on the actual state of the conversation. No external heuristic can match this judgment.

## Anti-Pattern 1: Parsing Natural Language

```python
# ANTI-PATTERN: Parsing natural language
while True:
    response = get_response()
    text = response.content[0].text
    if "task complete" in text.lower():
        break
    if "I'm done" in text.lower():
        break
```

**Why this fails**: Text content is meant for the user, not for control flow. The model may phrase completion differently every time ("All done!", "Here are the results", "I've finished the analysis"). You cannot reliably enumerate all possible phrasings.

## Anti-Pattern 2: Arbitrary Iteration Caps

```python
# ANTI-PATTERN: Iteration caps as primary stopping mechanism
for i in range(10):  # Hard cap at 10 iterations
    response = get_response()
    if no_tool_call(response):
        break
```

**Why this fails**: An iteration cap may cut the agent off mid-task (if 10 is not enough) or let it loop pointlessly (if the task finished at iteration 3). The cap does not reflect actual task completion.

## Anti-Pattern 3: Monitoring Token Counts

```python
# ANTI-PATTERN: Token-based termination
while total_tokens < 50000:
    response = get_response()
    total_tokens += response.usage.output_tokens
```

**Why this fails**: Token consumption has no relationship to task completion. A task might complete in 500 tokens or require 40,000. Token limits are a cost safety net, not a loop control mechanism.

## The Correct Approach

```python
# CORRECT: Check stop_reason field
while True:
    response = get_response()
    if response.stop_reason == "end_turn":
        break  # Claude decided it's done
    if response.stop_reason == "tool_use":
        execute_and_continue()
```

Tools like [[Claude Code]] implement this pattern internally. The loop runs until Claude signals completion through `stop_reason`, not through any external heuristic.

## Exam Tip

When you see a question about loop termination, look for the answer that references `stop_reason`. Then confirm by eliminating the distractors: any answer involving parsing text content, setting iteration limits, or monitoring token counts is an anti-pattern.
