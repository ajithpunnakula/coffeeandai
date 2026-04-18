---
id: card_9e2f4a7c
type: page
order: 2
difficulty: 1
title: "The Agentic Loop: Claude's Core Execution Model"
domain: "Agentic Architecture & Orchestration"
wiki_refs: ["Agentic Loop", "Agent SDK"]
source: "raw/agentic-architecture-orchestration.md"
speaker_notes: "This is the single most important concept in Domain 1. Drill the loop lifecycle until it is automatic: send message, check response, if tool_use then execute and append, if end_turn then exit. The Agent SDK automates this loop, but the exam tests whether you understand the underlying mechanics."
content_hashes:
  "Agentic Loop": "c3d4e5f6"
  "Agent SDK": "a7b8c9d0"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_9e2f4a7c-qDIWS05wTWOWPCH1XVZjC1pWXrDOdr.mp3"
---

# The Agentic Loop: Claude's Core Execution Model

The [[Agentic Loop]] is the fundamental execution pattern for every Claude-based agent. Unlike simple request-response interactions, an agentic loop allows Claude to **iteratively plan, act, observe, and decide** whether to continue or stop.

## The Loop Lifecycle

The agentic loop follows a precise sequence:

1. **Send a message** to Claude along with a set of available tools
2. **Claude responds** -- either with text (done) or a tool call (needs to act)
3. **If Claude called a tool**, you execute the tool and append the result to the conversation
4. **Send the updated conversation** back to Claude
5. **Repeat** until Claude responds with no more tool calls

## The stop_reason Field

The `stop_reason` field in the API response is the **only reliable signal** for controlling loop continuation:

- **`"tool_use"`** -- Claude wants to call a tool. Continue the loop by executing the tool and sending the result back.
- **`"end_turn"`** -- Claude has finished its work. Exit the loop and return the final response to the user.

## How It Looks in Code

```python
import anthropic

client = anthropic.Anthropic()
tools = [{"name": "lookup_customer", "description": "...", "input_schema": {}}]
messages = [{"role": "user", "content": "Find customer John Smith"}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        tools=tools,
        messages=messages
    )

    # KEY: Check stop_reason to control the loop
    if response.stop_reason == "end_turn":
        break  # Claude is done

    if response.stop_reason == "tool_use":
        tool_block = next(b for b in response.content if b.type == "tool_use")
        result = execute_tool(tool_block.name, tool_block.input)

        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [{"type": "tool_result",
                         "tool_use_id": tool_block.id,
                         "content": result}]
        })
```

## The Agent SDK Abstraction

The [[Agent SDK]] handles this loop automatically. When you create an Agent and call `agent.run()`, the SDK manages the send-check-execute-append cycle for you. However, the exam tests your understanding of the **underlying mechanics**, not just the SDK surface API.

Key points the exam tests:

- The loop continues as long as `stop_reason` is `"tool_use"`
- The loop terminates when `stop_reason` is `"end_turn"`
- Tool results are appended to the conversation as `tool_result` content blocks
- The model decides when it is done based on task state, not external signals
