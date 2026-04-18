---
title: "Source - Prompt Engineering and Structured Output"
type: source
date: 2026-04-17
source_file: "raw/prompt-engineering-structured-output.md"
tags: [certification, prompt-engineering, structured-output, exam-prep]
---

This source is the Domain 4 deep dive for the [[Claude Certified Architect Exam]], covering Prompt Engineering and Structured Output at approximately 20% of exam weight. It provides detailed explanations, code examples, and anti-pattern comparisons across four sub-topics.

Section d4.1 covers Explicit Criteria and Instruction Design, emphasizing that production prompts require specific, measurable criteria rather than vague instructions. The key principle is that vague prompts like "make it better" or "find issues" lead to inconsistent results and false positives, which cause alert fatigue and erode developer trust. The correct approach specifies concrete thresholds (e.g., "flag functions exceeding 50 lines") with severity classifications and structured output formats.

Section d4.2 covers Few-Shot Prompting, establishing that 2-4 examples is optimal for ambiguous tasks. All examples must follow the same output structure, and at least one should demonstrate an edge case. More than 6 examples bloats the prompt without proportional benefit. Few-shot is most valuable for ambiguous classification tasks, custom output formats, and domain-specific reasoning, but unnecessary for simple well-defined tasks with clear criteria.

Section d4.3 covers Tool Use for Structured Output, establishing the critical distinction that tool_use guarantees JSON schema compliance (structure) but not semantic correctness (content). The tool_choice parameter offers three modes: "auto" (model decides), "any" (must use a tool), and forced specific tool (guarantees schema compliance). Schema design best practices include using required fields, enums with an "other" category plus a detail field for edge cases, and nullable fields for potentially missing data. Semantic validation must occur separately after extraction.

Section d4.4 covers Validation-Retry Loops and Multi-Pass Review, detailing production patterns for improving output quality. The validation-retry loop extracts data via tool_use, validates against business rules, and retries with specific error details appended to the prompt. Generic retry messages like "there were errors, try again" provide no signal for correction. Multi-pass review uses per-file local analysis followed by cross-file integration passes. Same-session self-review is an anti-pattern because the model retains its reasoning context, creating blind spots. Batch processing via the [[Message Batches]] API provides 50% savings for non-urgent tasks like nightly audits.

## Key Topics

- Explicit, measurable criteria over vague instructions for production prompts
- Alert fatigue from false positives eroding developer trust
- Few-shot prompting: 2-4 examples optimal, include edge cases
- tool_use guarantees structure not semantics -- separate validation required
- tool_choice modes: auto, any, and forced specific tool
- JSON schema design with enums, "other" category, and nullable fields
- Validation-retry loops with specific error feedback (not generic messages)
- Multi-pass review: per-file local analysis plus cross-file integration
- Same-session self-review as an anti-pattern (reasoning context bias)
- [[Message Batches]] API for 50% cost savings on non-urgent tasks
- Detected_pattern fields for tracking systematic dismissal issues
