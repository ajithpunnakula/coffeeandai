---
id: card_2e5a9d8b
type: page
order: 9
difficulty: 1
title: "Tool Design Fundamentals"
domain: "Tool Design & MCP Integration"
wiki_refs: ["Structured Output", "Agent SDK"]
source: "raw/tool-design-mcp-integration.md"
speaker_notes: "This card introduces the single most important concept in tool design: the tool description is the interface contract between you and Claude. If the description is vague, Claude will guess wrong. Walk through the five elements every description needs, then hit the tool count threshold hard — 4 to 5 tools per agent is optimal, and above 18 selection accuracy falls off a cliff. The fix is not better descriptions; it is distributing tools across specialized subagents."
content_hashes:
  "Structured Output": "5389a972"
  "Agent SDK": "3ab24d61"
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_2e5a9d8b-9QBNnlLlLyBsD3iqizVwsIJ5wO6o34.mp3"
---

# Tool Design Fundamentals

Tool descriptions are the primary mechanism Claude uses to decide **when** and **how** to invoke a tool. A well-crafted description is not documentation for humans — it is an instruction set for the model. Vague or incomplete descriptions lead to incorrect tool selection, malformed inputs, and wasted agentic loop iterations.

## The Five Elements of an Effective Tool Description

Every tool description should include:

1. **Purpose** — A clear statement of what the tool does and when to use it (and when *not* to use it).
2. **Input specifications** — Precise types, formats, and constraints for each parameter.
3. **Examples** — At least one concrete input/output pair so Claude can pattern-match.
4. **Edge cases** — What happens with empty input, missing fields, or boundary values.
5. **Boundary conditions** — Explicit statements about what the tool cannot do, preventing misuse.

More detail in the description consistently produces better tool selection accuracy. This is not a place to be concise.

## The Tool Count Threshold

Optimal tool count per agent is **4-5 tools**. Research and exam guidance converge on a critical finding: once an agent has access to more than roughly 18 tools, selection accuracy degrades rapidly. The model spends more tokens reasoning about which tool to pick and still gets it wrong.

The solution is **not** to write longer descriptions. The solution is architectural: distribute tools across **specialized subagents** using the coordinator pattern from [[Agent SDK]]. Each subagent owns a focused set of 4-5 tools, and the coordinator routes requests to the right subagent.

This connects directly to [[Structured Output]] — when each subagent has a narrow tool set, the structured responses are more predictable and easier to validate.
