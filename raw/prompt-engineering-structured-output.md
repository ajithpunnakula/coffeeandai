---
title: "Prompt Engineering & Structured Output"
source: "https://claudecertifications.com/claude-certified-architect/domains/prompt-engineering"
author: ""
published: 
created: 2026-04-17
description: ""

tags:
  - "clippings"
---

[Skip to content](#main-content)

[Claude Certifications](/)

[Certified Architect](/claude-certified-architect)[Claude 101](/courses/claude-101)[Claude Code](/courses/claude-code-in-action)[AI Fluency](/courses/ai-fluency-foundations)[Videos](/videos)[Practice](/claude-certified-architect/practice-questions)[Exam Guide](/claude-certified-architect/exam-guide)[Register for Exam](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)[Domains](/claude-certified-architect/domains)Domain 4: Prompt Engineering

Domain 4 · ~20%

# Prompt Engineering & Structured Output

Master prompt engineering techniques for production systems. Covers explicit criteria, few-shot prompting, tool\_use for structured output, JSON schema design, validation-retry loops, and multi-pass review strategies.

## In This Domain

[d4.1Explicit Criteria & Instruction Design](#d4.1)[d4.2Few-Shot Prompting](#d4.2)[d4.3Tool Use for Structured Output](#d4.3)[d4.4Validation-Retry Loops & Multi-Pass Review](#d4.4)

d4.1

## Explicit Criteria & Instruction Design

Write prompts with explicit, measurable criteria instead of vague instructions. Understand how false positives impact developer trust.

### Prompt design principles:

Explicit criteria over vague instructions: 'flag functions over 50 lines' vs 'flag long functions'

False positive impact: too many false positives erode developer trust in the system

Specificity reduces ambiguity and improves consistency across runs

Measurable criteria enable automated validation of output quality

### Anti-Patterns to Avoid

Vague instructions like 'make it better' or 'improve the code'

Not considering the downstream impact of false positives

Deep Dive — Detailed Explanation, Code & Comparisons

Production prompts require **explicit, measurable criteria** instead of vague instructions. This is a fundamental principle tested across multiple exam scenarios.

**Why vagueness fails in production:**

•- "Make it better" — better how? Faster? Cleaner? Shorter?

•- "Find issues" — what counts as an issue? Every style nit? Only bugs?

•- "Be thorough" — leads to over-flagging, false positives, eroded trust

**The false positive problem:**

When a code review tool flags too many non-issues, developers start ignoring ALL flags — including real problems. This is called **alert fatigue** and is directly tested on the exam.

**The fix — measurable criteria:**

Instead of "flag long functions," specify "flag functions exceeding 50 lines of code." Instead of "find security issues," specify "identify hardcoded strings matching patterns for API keys, passwords, or connection strings."

Measurable criteria:

•- Enable consistent results across runs

•- Allow automated validation (you can verify flagged functions are actually >50 lines)

•- Reduce false positives by narrowing scope

•- Build developer trust in the system

Code Example

explicit-criteria.py — Vague vs Explicit Prompts

```
1# VAGUE: Results are inconsistent and over-flag

2vague_prompt = """

3Review this code for quality issues.

4Be thorough and flag anything suspicious.

5"""

6

7# EXPLICIT: Results are consistent and actionable

8explicit_prompt = """

9Review this code and flag ONLY the following:

101. Functions exceeding 50 lines of code

112. Async operations missing try-catch error handling

123. Hardcoded strings matching API key patterns (sk-, pk-, key-)

134. Public functions missing JSDoc documentation

145. SQL queries constructed with string concatenation

15

16For each issue found, provide:

17- File path and line number

18- Which rule (1-5) was violated

19- Severity: critical (3,5) | warning (1,2) | info (4)

20- One-line fix suggestion

21"""
```

🎯Exam Tip

Every time the exam asks about prompt design for production systems, the correct answer uses specific, measurable criteria. If an option says 'be thorough' or 'find all issues,' it's wrong.

d4.2

## Few-Shot Prompting

Use few-shot examples to guide Claude's output format and reasoning. Know when and how many examples to provide.

### Few-shot prompting techniques:

2-4 examples: optimal for ambiguous cases to establish format and reasoning patterns

Format consistency: all examples should follow the same output structure

Edge case coverage: include at least one example that handles an edge case

Few-shot is most valuable when the task has ambiguous boundaries

### Anti-Patterns to Avoid

Too many examples (>6) that bloat the prompt without adding value

Inconsistent formatting across examples confusing the model

Deep Dive — Detailed Explanation, Code & Comparisons

**Few-shot prompting** provides 2-4 examples that establish the expected output format, reasoning pattern, and edge case handling. It's most valuable when the task has ambiguous boundaries.

**The golden rules of few-shot prompting:**

•- **2-4 examples** — Fewer than 2 doesn't establish a pattern; more than 4-6 bloats without proportional benefit

•- **Format consistency** — All examples must follow the identical output structure

•- **Edge case coverage** — At least one example should demonstrate an ambiguous or edge case

•- **Diversity** — Cover different categories (positive/negative/neutral, simple/complex)

**When few-shot is most valuable:**

•- Ambiguous classification tasks (sentiment with sarcasm, mixed reviews)

•- Custom output formats that aren't standard

•- Domain-specific reasoning patterns

•- Tasks where the boundary between categories is fuzzy

**When few-shot is unnecessary:**

•- Simple, well-defined tasks (e.g., "extract the email address")

•- Tasks with clear, objective criteria

•- Standard output formats (JSON, XML) that Claude handles natively

Code Example

few-shot.py — Well-Structured Examples

```
1few_shot_prompt = """

2Classify customer reviews. Provide sentiment and reasoning.

3

4Example 1 (Clear positive):

5Input: "Absolutely love this product! Best purchase this year."

6Output: {"sentiment": "positive", "confidence": "high",

7         "reasoning": "Strong positive language, superlative"}

8

9Example 2 (Clear negative):

10Input: "Terrible experience. Product broke after 2 days."

11Output: {"sentiment": "negative", "confidence": "high",

12         "reasoning": "Explicit negative + product failure"}

13

14Example 3 (Ambiguous — mixed sentiment):

15Input: "Great features but the battery life is disappointing."

16Output: {"sentiment": "mixed", "confidence": "medium",

17         "reasoning": "Positive on features, negative on battery"}

18

19Example 4 (Edge case — sarcasm):

20Input: "Oh wonderful, another update that breaks everything."

21Output: {"sentiment": "negative", "confidence": "medium",

22         "reasoning": "Sarcastic positive masking frustration"}

23

24Now classify this review:

25Input: "{user_review}"

26"""
```

🎯Exam Tip

The exam tests whether you know the optimal number of few-shot examples (2-4) and that at least one should cover an edge case. More than 6 examples is always wrong — it bloats the prompt without added value.

d4.3

## Tool Use for Structured Output

Use tool\_use to guarantee JSON schema compliance. Understand the difference between schema compliance and semantic correctness.

### Structured output via tool\_use:

tool\_use guarantees JSON schema compliance — the output will match the defined structure

Semantic errors are still possible: the structure is correct but the content may be wrong

tool\_choice options: 'auto', 'any', or forced specific tool for guaranteed invocation

Schema design: required vs optional fields, enums with 'other' + detail, nullable fields

### Anti-Patterns to Avoid

Assuming tool\_use eliminates all errors (it only guarantees structural compliance)

Not using enums with 'other' category for fields that may have unexpected values

Deep Dive — Detailed Explanation, Code & Comparisons

**tool\_use** is the most reliable way to get structured output from Claude. By defining a tool with a JSON schema, you guarantee the output matches the schema structure.

**Critical distinction:**

•- **tool\_use guarantees STRUCTURE** — all required fields present, correct types, valid enum values

•- **tool\_use does NOT guarantee SEMANTICS** — the values might be wrong (wrong name extracted, wrong date, etc.)

This means you still need validation after extraction. The schema ensures you get a valid JSON object, but the content inside might contain errors.

**tool\_choice parameter:**

•- **"auto"** — Claude decides whether to use a tool (default, general-purpose)

•- **"any"** — Claude must use a tool but can choose which

•- **{"type":"tool","name":"X"}** — Force a specific tool (for extraction, guarantees schema compliance)

**Schema design best practices:**

•- Always include "required" for mandatory fields

•- Use "enum" for categorical fields with known values

•- Include an "other" category in enums + a detail field for edge cases

•- Use ["string", "null"] for fields that might be missing

•- Add "description" to each property for clarity

Code Example

tool-use-extraction.py — Structured Output via tool\_use

```
1import anthropic

2client = anthropic.Anthropic()

3

4extract_tool = {

5    "name": "extract_invoice",

6    "description": "Extract structured data from an invoice",

7    "input_schema": {

8        "type": "object",

9        "properties": {

10            "vendor_name": {"type": "string"},

11            "invoice_number": {"type": "string"},

12            "date": {"type": "string", "description": "ISO 8601"},

13            "total": {"type": "number"},

14            "document_type": {

15                "type": "string",

16                "enum": ["standard_invoice", "credit_note",

17                         "proforma", "other"]

18            },

19            "document_type_detail": {

20                "type": "string",

21                "description": "Required if document_type is other"

22            }

23        },

24        "required": ["vendor_name", "invoice_number",

25                     "date", "total", "document_type"]

26    }

27}

28

29# Force this specific tool = guarantees schema compliance

30response = client.messages.create(

31    model="claude-sonnet-4-20250514",

32    tools=[extract_tool],

33    tool_choice={"type": "tool", "name": "extract_invoice"},

34    messages=[{"role": "user", "content": f"Extract: {invoice}"}]

35)
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Assuming tool_use catches all errors
data = extract_via_tool_use(invoice)
# "It's from tool_use, so it must be correct!"
save_to_database(data)  # No validation!
# Structure is valid, but vendor_name might be wrong
```

✓Correct

```
# Validate SEMANTICS after tool_use
data = extract_via_tool_use(invoice)
# Structure guaranteed, but verify content:
errors = []
if not re.match(r"\d{4}-\d{2}-\d{2}", data["date"]):
    errors.append("Invalid date format")
if data["total"] <= 0:
    errors.append("Total must be positive")
if errors:
    retry_with_errors(invoice, errors)
```

🎯Exam Tip

tool\_use guarantees STRUCTURE, not SEMANTICS. The exam will present options claiming tool\_use eliminates all errors — that's always wrong. You still need to validate extracted values.

d4.4

## Validation-Retry Loops & Multi-Pass Review

Implement validation-retry patterns and multi-pass review strategies for reliable output. Understand when retries are effective and when they are not.

### Validation and review patterns:

Validation-retry loops: append specific errors to the prompt and retry for self-correction

detected\_pattern fields: track dismissal patterns to identify systematic issues

Multi-pass review: per-file local analysis + cross-file integration pass

Self-review limitations: same session retains reasoning context, reducing effectiveness

Batch processing: synchronous for blocking tasks, batch for latency-tolerant workloads

### Anti-Patterns to Avoid

Same-session self-review (the model retains its reasoning context, creating bias)

Generic retry without appending specific error information

Aggregate accuracy metrics masking per-document-type failures

Deep Dive — Detailed Explanation, Code & Comparisons

**Validation-retry loops** and **multi-pass review** are production patterns for improving output quality.

**Validation-retry loop:**

1.1. Extract data using tool\_use

2.2. Validate the output against business rules

3.3. If validation fails, **append specific error details** and retry

4.4. The model corrects based on the explicit feedback

5.5. Track systematic failures with detected\_pattern fields

**Key principle: Specific error feedback, not generic.**

•- Wrong: "There were errors, please try again"

•- Right: "Line items total ($450) doesn't match subtotal ($500). Tax field contains a percentage (10%) instead of a dollar amount."

**Multi-pass review strategy:**

•- **Pass 1 (Local)**: Review each file independently — catches syntax, naming, missing error handling

•- **Pass 2 (Cross-file)**: Review how files interact — catches broken imports, interface mismatches

**Same-session self-review limitation:**

When the same session generates and reviews code, it retains the original reasoning context creating a blind spot. Fix: use **separate sessions** for generation and review.

**Batch processing strategy:**

•- Blocking PR review → Use synchronous

•- Nightly code audit → Use Batch API (50% savings)

•- Real-time feedback → Use synchronous

•- Weekly compliance scan → Use Batch API (50% savings)

Code Example

validation-retry.py — Specific Error Feedback Loop

```
1def extract_with_validation(document, max_retries=3):

2    messages = [{"role": "user", "content": f"Extract: {document}"}]

3

4    for attempt in range(max_retries):

5        response = client.messages.create(

6            model="claude-sonnet-4-20250514",

7            tools=[extract_tool],

8            tool_choice={"type": "tool", "name": "extract_invoice"},

9            messages=messages,

10        )

11

12        data = parse_tool_response(response)

13        errors = validate(data)

14

15        if not errors:

16            return data  # Valid — return results

17

18        # CRITICAL: Append SPECIFIC errors for retry

19        messages.append({"role": "assistant", "content": response.content})

20        messages.append({

21            "role": "user",

22            "content": f"Validation failed. Fix these errors:\n"

23                + "\n".join(f"- {e}" for e in errors)

24                + "\nRe-extract with corrections."

25        })

26

27    raise ExtractionError(f"Failed after {max_retries} attempts")

28

29def validate(data):

30    errors = []

31    if data["total"] <= 0:

32        errors.append(f"Total must be positive, got {data['total']}")

33    if sum(i["total"] for i in data["line_items"]) != data["subtotal"]:

34        errors.append("Line items sum doesn't match subtotal")

35    return errors
```

🎯Exam Tip

Three must-know facts: (1) Retry with SPECIFIC error details, not generic messages. (2) Same-session self-review is an anti-pattern. (3) Use Batch API for non-urgent tasks (50% cost savings).

## Exam Tips for Domain 4

1.

Explicit, measurable criteria > vague instructions (always)

2.

2-4 few-shot examples is the sweet spot for ambiguous tasks

3.

tool\_use = structural compliance, NOT semantic correctness

4.

Same-session self-review is an anti-pattern — use separate sessions

## Related Exam Scenarios

[2

### Code Generation with Claude Code

Configure Claude Code for a development team workflow. Tests CLAUDE.md configuration, plan mode, slash commands, and iterative refinement strategies.](/claude-certified-architect/scenarios#scenario-2)[5

### Claude Code for CI/CD

Integrate Claude Code into continuous integration and delivery pipelines. Tests -p flag usage, structured output, batch API, and multi-pass code review.](/claude-certified-architect/scenarios#scenario-5)[6

### Structured Data Extraction

Build a structured data extraction pipeline from unstructured documents. Tests JSON schemas, tool\_use, validation-retry loops, and few-shot prompting.](/claude-certified-architect/scenarios#scenario-6)

## Test Your Knowledge of Prompt Engineering

Practice with scenario-based questions covering this domain.

[Practice Questions](/claude-certified-architect/practice-questions)

[Previous Domain

Claude Code Config](/claude-certified-architect/domains/claude-code-config)[Next Domain

Context & Reliability](/claude-certified-architect/domains/context-management)

[Claude Certifications](/)

Free courses, study guides, and certification prep for Claude and agentic AI development. Learn at your own pace with hands-on lessons and practice quizzes.

### Courses

* [All Courses](/courses)
* [Claude 101](/courses/claude-101)
* [What Is Claude?](/courses/claude-101/what-is-claude)
* [Claude Projects](/courses/claude-101/introduction-to-projects)
* [Claude Code in Action](/courses/claude-code-in-action)
* [MCP Servers Guide](/courses/claude-code-in-action/mcp-servers)
* [Video Tutorials](/videos)

### Architect Certification

* [12-Week Study Plan](/claude-certified-architect/study-guide)
* [Exam Domains](/claude-certified-architect/domains)
* [Practice Questions](/claude-certified-architect/practice-questions)
* [Exam Guide](/claude-certified-architect/exam-guide)
* [Anti-Patterns](/claude-certified-architect/anti-patterns)
* [FAQ](/claude-certified-architect/faq)

### Quick Links

* [Browse All Courses](/courses)
* [Architect Cert Overview](/claude-certified-architect)
* [Disclaimer & Sources](/disclaimer)

© 2026 claudecertifications.com. All trademarks belong to their respective owners.

Built for the Claude architect community
