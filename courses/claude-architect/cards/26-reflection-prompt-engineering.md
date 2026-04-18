---
id: card_c4a7d2e8
type: reflection
order: 26
difficulty: 3
title: "Reflect on Your Prompt Engineering"
domain: "Prompt Engineering & Structured Output"
wiki_refs: ["Structured Output"]
prompt: |
  Review a prompt you have written for a production system (or imagine one for a system you would like to build). Consider these questions carefully:

  1. Are your success criteria explicit and measurable, or are they vague directives like "be thorough" or "find all issues"? How would a 5% false positive rate at scale affect developer trust in your tool?

  2. If you are using structured output, are you relying solely on tool_use for correctness, or do you have a semantic validation layer that checks values after structural compliance? What business rules should your validator enforce?

  3. How would you add a validation-retry loop? What specific error information would you include in the retry message -- field name, actual value, expected value, violated rule?

  4. What would happen if you replaced "find all issues" with "flag functions over 50 lines with no docstring"? How would that change the signal-to-noise ratio of your output?

  5. If your system includes a review step, is it a same-session self-review (which inherits blind spots) or a separate-session review with a dedicated reviewer prompt?
---
