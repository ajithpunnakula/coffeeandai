---
title: "Structured Output"
type: concept
tags: [features, agent-sdk, claude-code]
sources: ["raw/get-structured-output-from-agents.md", "raw/agent-sdk-reference-python.md", "raw/agent-sdk-reference-typescript.md", "raw/prompt-engineering-structured-output.md"]
---

# Structured Output

Structured Output is the capability to constrain [[Claude Code]] and [[Agent SDK]] responses to a specific JSON Schema, producing validated, machine-readable results instead of free-form text. It is essential for building programmatic pipelines where downstream systems depend on predictable output formats.

## CLI usage

The `--json-schema` flag combined with `--output-format json` enforces a JSON Schema on the response. The validated result appears in the `structured_output` field of the JSON output. This works with `claude -p` for scripted workflows.

## SDK integration

In the [[Agent SDK]], structured output integrates with type-safe schema libraries:

- **TypeScript**: Zod schemas passed to `query()` or `send()` — the SDK validates the response and returns a typed object
- **Python**: Pydantic models passed as the `output_schema` parameter — the SDK extracts and validates against the model

Both approaches use the same underlying mechanism: the schema is converted to JSON Schema and sent to the API, which constrains the model's output to conform.

## Prompt engineering techniques

The [[Claude Certified Architect Exam]] covers several structured output patterns: using `tool_use` blocks to force structured responses (rather than asking the model to output JSON in text), explicit evaluation criteria for grading tasks, few-shot examples to demonstrate expected formats, and validation-retry loops that re-prompt when output fails schema validation.

## See also

- [[Agent SDK]], [[Claude Code]]
- [[Source - Get Structured Output from Agents]], [[Source - Prompt Engineering and Structured Output]]
