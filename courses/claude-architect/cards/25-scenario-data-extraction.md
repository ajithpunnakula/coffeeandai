---
id: card_39f8b5c1
type: scenario
order: 25
difficulty: 3
title: "Scenario: Structured Data Extraction Pipeline"
domain: "Prompt Engineering & Structured Output"
wiki_refs: ["Structured Output", "Agent SDK"]
source: "raw/6-exam-scenarios-deep-dive.md"
steps:
  - id: start
    situation: "You are building a pipeline to extract structured data from invoices. Hundreds of invoices arrive daily in varying formats. You need Claude to return valid, parseable JSON for each invoice. How do you ensure Claude returns valid JSON?"
    choices:
      - text: "Use tool_use with a JSON schema and forced tool_choice to guarantee structural compliance"
        next: tool_use_path
        score: 3
      - text: "Add 'please output as JSON' to the prompt and parse the response text"
        next: prompt_json
        score: 0
      - text: "Let Claude output free text and post-process it with regex to extract fields"
        next: regex_path
        score: 0
  - id: tool_use_path
    situation: "Good choice. You define a tool with a JSON schema for invoice data. The schema needs a document_type field to categorize invoices. Some invoices do not fit your predefined categories (utilities, consulting, supplies). How do you handle non-standard document types?"
    choices:
      - text: "Use an enum with an 'other' value plus a document_type_detail free-text field for explanation"
        next: schema_design
        score: 3
      - text: "Use a strict enum with only the predefined categories and no fallback"
        next: strict_enum
        score: 0
      - text: "Use a free-text string field so any category can be entered"
        next: free_text
        score: 1
  - id: prompt_json
    situation: "Prompt-based JSON output is not guaranteed. Claude may add explanation text before or after the JSON, wrap it in markdown code fences, or produce invalid JSON when the content is complex. Your regex parser breaks on the first unusual invoice."
    choices:
      - text: "Switch to tool_use with a JSON schema for guaranteed structural compliance"
        next: tool_use_path
        score: 1
  - id: regex_path
    situation: "Regex parsing of unstructured Claude output is fragile. When the output format varies slightly -- different field ordering, nested structures, escaped characters -- your regex breaks. This approach does not scale."
    choices:
      - text: "Switch to tool_use with a JSON schema for guaranteed structural compliance"
        next: tool_use_path
        score: 1
  - id: schema_design
    situation: "Your schema handles edge cases well. The pipeline runs on a batch of 100 invoices. You review the results and find that while all JSON is structurally valid, some dates are in the wrong format (MM/DD/YYYY instead of ISO 8601) and several invoice totals do not match the sum of their line items. What happened?"
    choices:
      - text: "tool_use guarantees structure, not semantics -- you need a semantic validation layer to check values"
        next: validation_step
        score: 3
      - text: "The JSON schema must be defined incorrectly"
        next: schema_wrong
        score: 0
      - text: "Claude made a random error -- just retry the failed invoices"
        next: blind_retry
        score: 0
  - id: strict_enum
    situation: "Documents that do not fit your predefined categories get forced into the closest wrong type. A software license invoice gets categorized as 'consulting' and a maintenance contract becomes 'supplies.' This corrupts your downstream data and reporting."
    choices:
      - text: "Add an 'other' category with a detail field to handle non-standard types"
        next: schema_design
        score: 1
  - id: free_text
    situation: "Free-text category values defeat the purpose of structured output. You get inconsistent values like 'Consulting,' 'consulting services,' 'Professional Services / Consulting,' and 'consult.' Downstream systems cannot aggregate by category."
    choices:
      - text: "Use an enum with an 'other' value plus a detail field for edge cases"
        next: schema_design
        score: 1
  - id: validation_step
    situation: "You add a semantic validation layer that checks date formats, verifies arithmetic (line item totals match invoice total), and validates cross-field consistency. A date field fails validation on an invoice: the value is '03/15/2026' but your system requires ISO 8601 format. How do you handle the retry?"
    choices:
      - text: "Append the specific error to the conversation: 'invoice_date format invalid: got 03/15/2026, expected ISO 8601 (YYYY-MM-DD)'"
        next: end_proper
        score: 3
      - text: "Send a generic message: 'there were errors in the output, please try again'"
        next: end_generic_retry
        score: 0
      - text: "Skip the invalid record and move on to the next invoice"
        next: end_skip
        score: 1
  - id: schema_wrong
    situation: "The schema is structurally correct -- tool_use is producing valid JSON that matches it. The issue is that tool_use guarantees structural compliance, not semantic correctness. The values inside the valid JSON structure may still be wrong. You need a separate validation step."
    choices:
      - text: "Add a semantic validation layer to check values after structural compliance"
        next: validation_step
        score: 1
  - id: blind_retry
    situation: "You retry the failed invoices without any error feedback. Claude produces the same incorrect date formats and mismatched totals. Without knowing WHAT was wrong, the model has no signal to change its approach."
    choices:
      - text: "Add specific validation feedback so the model knows exactly what to fix"
        next: validation_step
        score: 1
  - id: end_proper
    outcome: "Excellent. You built a production-quality extraction pipeline: tool_use for guaranteed structure, a flexible schema with an 'other' category for edge cases, semantic validation catching value errors, and specific error feedback enabling targeted fixes on retry. This is the pattern that scales to hundreds of invoices daily."
    total_score: best
  - id: end_generic_retry
    outcome: "Generic retry messages give the model no signal about what to fix. Without knowing which field failed, what the actual value was, and what was expected, the model is guessing blindly. The same errors will recur. Always append SPECIFIC error details: which field, what is wrong, expected vs actual."
    total_score: poor
  - id: end_skip
    outcome: "Skipping invalid records means data loss. With a proper validation-retry loop using specific error feedback, most extraction errors can be corrected automatically. Skipping should be a last resort after retry attempts are exhausted, not the first response to an error."
    total_score: partial
---
