---
id: card_c3f7b1e4
type: page
order: 10
difficulty: 2
title: "Structured Error Responses"
domain: "Tool Design & MCP Integration"
wiki_refs: ["Structured Output", "Agentic Loop"]
source: "raw/tool-design-mcp-integration.md"
speaker_notes: "This is one of the most exam-critical distinctions in the entire certification. The difference between an access failure and an empty result sounds obvious, but in practice tools silently conflate them all the time. Walk through the database timeout example carefully: returning an empty array when the connection times out tells the agent that nothing exists, when in reality it could not even check. The agent then confidently reports 'no results found' to the user. This is a catastrophic misunderstanding, not a minor bug. Stress the four fields every structured error needs."
content_hashes:
  "Structured Output": "5389a972"
  "Agentic Loop": "5440253f"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_c3f7b1e4-jDJYqMmBWCc5lhRyTZ3ErYCYBIKpxH.mp3"
---

# Structured Error Responses

One of the most dangerous anti-patterns in tool design is **silent error suppression** — returning what looks like a valid response when the tool actually failed. This is a critical exam topic and a critical production concern.

## The Core Distinction: Access Failure vs. Empty Result

These two situations look identical if your tool returns `[]` for both:

- **Access failure**: "I could not check — the database timed out, the API returned 503, the file was locked."
- **Empty result**: "I checked successfully and found nothing matching your criteria."

An agent receiving `[]` in both cases will confidently tell the user "no results found" — even when it never actually looked. This is not a minor UX issue. It is a **catastrophic misunderstanding** that can drive completely wrong downstream decisions in the [[Agentic Loop]].

## The Four Fields of a Structured Error

Every tool error response should include:

| Field | Purpose |
|---|---|
| `isError` | Boolean flag so the agent knows this is not a normal result |
| `errorCategory` | Classification: `auth`, `timeout`, `not_found`, `validation`, `internal` |
| `isRetryable` | Whether the agent should attempt the same call again |
| `context` | Human-readable detail: what failed, why, and what to try instead |

A generic "Operation failed" message gives the agent **no recovery signal**. It cannot decide whether to retry, try a different tool, or escalate to the user. With [[Structured Output]] patterns, you can enforce this schema at the type level so malformed errors never reach the agent.

## Anti-Pattern: Silent Suppression

Returning `[]` when the database times out is the canonical example, but the pattern appears everywhere: returning `null` when an API key is invalid, returning a default value when a config file is missing, catching exceptions and returning empty strings. Every one of these robs the agent of the information it needs to act correctly.
