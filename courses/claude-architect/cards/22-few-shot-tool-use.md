---
id: card_84a3c6e2
type: page
order: 22
difficulty: 2
title: "Few-Shot Prompting and tool_use for Structured Output"
domain: "Prompt Engineering & Structured Output"
wiki_refs: ["Structured Output", "Agent SDK"]
source: "raw/prompt-engineering-structured-output.md"
content_hashes:
  "Structured Output": "b4c27d53"
  "Agent SDK": "e8f16a90"
speaker_notes: |
  This card covers two complementary techniques that often appear together on the exam: few-shot examples for teaching patterns, and tool_use for enforcing structure. Walk through the few-shot sweet spot first -- 2 to 4 examples. Show why fewer than 2 fails to establish a pattern (the model might treat a single example as coincidence rather than a rule) and why more than 6 wastes context without proportional improvement. Emphasize that at least one example should demonstrate an edge case. Then transition to tool_use: the critical exam point is that tool_use guarantees STRUCTURE only, not semantic correctness. The JSON will be valid and match the schema, but the values inside may still be wrong. This distinction trips up many exam takers. Finish with the three tool_choice options and when to use each.
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_84a3c6e2-isIINj3q4sOi3BJS0zouqyNnBKCD2n.mp3"
---

# Few-Shot Prompting and tool_use for Structured Output

Two techniques form the backbone of reliable structured output from Claude: **few-shot examples** to establish patterns, and **tool_use** with JSON schemas to enforce output structure.

## Few-Shot Prompting: The Sweet Spot

The optimal number of few-shot examples is **2-4**:

- **Fewer than 2** does not reliably establish a pattern. A single example might be treated as one possible approach rather than the required format.
- **More than 6** bloats the prompt without proportional benefit. The marginal improvement from additional examples drops sharply after 4, while context window consumption continues to grow linearly.

At least one example should cover an **edge case** -- an unusual input, an empty field, a boundary condition. This teaches Claude how to handle the unexpected, not just the happy path.

## tool_use: Guaranteed Structure

The `tool_use` feature lets you define a JSON schema and force Claude to return output conforming to that schema. Combined with `tool_choice`, this gives you three levels of control:

| tool_choice value | Behavior |
|---|---|
| `"auto"` | Claude decides whether to use a tool |
| `"any"` | Claude must use some tool (picks which one) |
| `{"type": "tool", "name": "X"}` | Claude must use the specific tool named X |

When you need guaranteed structured output, use the forced form (`{"type": "tool", "name": "extract_data"}`) to ensure Claude always returns JSON matching your schema.

## The Critical Distinction: Structure vs. Semantics

**tool_use guarantees STRUCTURE only, not semantic correctness.** The output will be valid JSON that conforms to your schema -- correct field names, correct types, correct nesting. But the **values** inside that JSON may still be wrong:

- A date field will be a string in the right format, but might contain the wrong date.
- A numeric total will be a number, but might not match the actual sum.
- A category field will be one of your enum values, but might be the wrong category.

This means you must **validate semantics separately** after receiving structurally valid output. Schema compliance is necessary but not sufficient for correctness.

**Exam tip:** Questions about tool_use often present a scenario where the JSON is valid but contains incorrect values. The correct answer is always that tool_use guarantees structure, not semantics -- additional validation is required.
