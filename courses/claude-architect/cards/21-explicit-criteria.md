---
id: card_f1e4b7d9
type: page
order: 21
difficulty: 2
title: "Explicit Criteria Over Vague Instructions"
domain: "Prompt Engineering & Structured Output"
wiki_refs: ["Structured Output", "Claude Code"]
source: "raw/prompt-engineering-structured-output.md"
content_hashes:
  "Structured Output": "a3f19b42"
  "Claude Code": "d7e08c15"
speaker_notes: |
  Start by showing a real example of a vague prompt ("find all potential issues") and the kind of noisy output it produces -- dozens of low-value flags that developers learn to ignore. Then contrast with a precise prompt ("flag functions exceeding 50 lines with no docstring") and show how the output becomes immediately actionable. The key insight for the exam is that false positives erode trust faster than missed issues. A tool that cries wolf gets ignored entirely, which is worse than one that occasionally misses something. Production prompts need precision, not coverage maximization. Ask the group: how many of you have turned off a linter rule because it was too noisy?
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_f1e4b7d9-WyDybO7G8F6YiRS4Vvg4tFodnsXkcK.mp3"
---

# Explicit Criteria Over Vague Instructions

One of the most common mistakes when prompting Claude for code review, data validation, or any analytical task is using vague directives like "be thorough," "find all issues," or "check everything." These instructions feel comprehensive, but they produce the opposite of useful output.

## The Problem with Vague Prompts

When Claude receives an instruction like "find all potential issues in this code," it has no principled way to decide what counts as an issue. The result is **over-flagging**: every minor style inconsistency, every hypothetical edge case, and every debatable pattern gets reported alongside genuine bugs. This creates **alert fatigue** -- developers see a wall of low-value findings and stop reading the output entirely.

False positives erode trust faster than missed issues. A tool that consistently flags real problems but occasionally misses one is far more valuable than a tool that flags everything including noise. The first gets used; the second gets ignored.

## The Fix: Explicit, Measurable Criteria

Replace vague instructions with **specific, measurable rules**:

| Vague | Explicit |
|-------|----------|
| "Find all issues" | "Flag functions exceeding 50 lines" |
| "Check for problems" | "Report imports unused in any file" |
| "Be thorough" | "Identify public methods with no docstring" |
| "Look for bugs" | "Flag null dereferences where input is not validated within 3 lines of receipt" |

Each explicit criterion has a **clear threshold** that eliminates ambiguity. Claude can evaluate each rule mechanically, and the developer reviewing the output can immediately verify whether each finding is correct.

## Why This Matters for Production

In production systems, prompts are not one-off experiments -- they run repeatedly across many inputs. A 5% false positive rate that seems acceptable in testing becomes hundreds of false alerts per day at scale. Explicit criteria let you **tune precision**: you can add, remove, or adjust individual rules based on observed false positive rates without rewriting the entire prompt.

**Exam tip:** When a question presents a scenario where an AI-powered tool is generating too many false positives or users are ignoring its output, the answer almost always involves replacing vague criteria with explicit, measurable thresholds.
