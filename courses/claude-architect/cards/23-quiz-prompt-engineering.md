---
id: card_b5d8f1a9
type: quiz
order: 23
difficulty: 2
title: "Quiz: Prompt Engineering Techniques"
domain: "Prompt Engineering & Structured Output"
wiki_refs: ["Structured Output"]
pass_threshold: 0.8
questions:
  - prompt: "A code review prompt says 'find all potential issues.' The tool generates dozens of findings per file and developers have stopped reading its output. What is the root cause?"
    objective: "Identify that vague criteria cause over-flagging and erode developer trust"
    source: "raw/prompt-engineering-structured-output.md"
    choices:
      - text: "Vague criteria cause over-flagging and alert fatigue -- developers stop trusting results when most findings are noise"
        correct: true
      - text: "The prompt is too short and needs to be longer to work properly"
        correct: false
        misconception: "Length is not the issue. A short prompt with explicit criteria outperforms a long vague one. Specificity matters, not word count."
      - text: "Claude cannot perform code review tasks reliably"
        correct: false
        misconception: "Claude handles code review well when given precise criteria. The problem is the prompt, not the model's capability."
      - text: "The prompt needs more context about the codebase architecture"
        correct: false
        misconception: "Additional context helps with accuracy but does not fix vague criteria. Without explicit thresholds, more context just means more things to over-flag."
  - prompt: "How many few-shot examples should you include for optimal structured output performance?"
    objective: "Recall the 2-4 example sweet spot with edge case coverage"
    source: "raw/prompt-engineering-structured-output.md"
    choices:
      - text: "2-4 examples covering both normal cases and at least one edge case"
        correct: true
      - text: "As many as possible to maximize accuracy and coverage"
        correct: false
        misconception: "Beyond 6 examples, returns diminish sharply while context consumption grows linearly. More examples waste tokens without proportional improvement."
      - text: "1 example is sufficient to establish the output pattern"
        correct: false
        misconception: "A single example does not reliably demonstrate variation. The model may treat it as one possible approach rather than the required format."
      - text: "Few-shot examples are unnecessary when using tool_use with a JSON schema"
        correct: false
        misconception: "Even with schema enforcement, few-shot examples improve the quality and consistency of values inside the structured output. Schema handles structure; examples teach semantics."
  - prompt: "Using tool_use with a JSON schema and forced tool_choice guarantees which of the following?"
    objective: "Distinguish structural compliance from semantic correctness"
    source: "raw/prompt-engineering-structured-output.md"
    choices:
      - text: "Structural compliance -- the output will be valid JSON matching the defined schema"
        correct: true
      - text: "Semantic correctness of all extracted values within the JSON"
        correct: false
        misconception: "tool_use validates structure, not meaning. A date field will be a string in the right format but may contain the wrong date. Semantic validation must be done separately."
      - text: "The output will always be factually accurate and error-free"
        correct: false
        misconception: "Schema compliance says nothing about factual accuracy. The JSON structure will be correct, but values may be wrong, hallucinated, or misattributed."
      - text: "No further validation is needed before using the output in production"
        correct: false
        misconception: "Structural validity is necessary but not sufficient. Semantic validation -- checking that values are correct, consistent, and sensible -- is still required."
---
