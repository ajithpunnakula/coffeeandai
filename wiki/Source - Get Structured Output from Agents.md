---
title: "Source - Get Structured Output from Agents"
type: source
date: 2026-04-17
source_file: "raw/get-structured-output-from-agents.md"
tags: [agent-sdk, structured-output, json-schema, validation]
---

This source documents how to obtain validated JSON output from [[Agent SDK]] agents using JSON Schema, Zod (TypeScript), or Pydantic (Python). Structured outputs allow developers to define the exact shape of data they want back from an agent, even after multi-turn tool use.

The feature is enabled via the `outputFormat` option (TypeScript) or `output_format` option (Python), which accepts an object with `type: "json_schema"` and a `schema` field containing a standard JSON Schema definition. The agent can use any tools needed to complete its task, and the SDK validates the final output against the schema, re-prompting on mismatch. If validation fails after the retry limit, the result is an `error_max_structured_output_retries` error rather than structured data.

For type safety, Zod schemas (TypeScript) can be converted to JSON Schema with `z.toJSONSchema()`, and Pydantic models (Python) with `.model_json_schema()`. Both approaches give developers strongly-typed objects with autocomplete, type checking, and runtime validation via `safeParse()` or `model_validate()`.

The document illustrates the feature with two examples. A company information extraction example shows basic schema definition with required and optional fields. A TODO tracking agent example demonstrates structured output combined with multi-step tool use -- the agent runs Grep to find TODOs, Bash for git blame, and combines results into a schema-defined structure with optional `author` and `date` fields.

The `structured_output` field appears only on `ResultMessage` with `subtype === "success"`. It is not available as streaming deltas. Supported JSON Schema features include basic types, enum, const, required, nested objects, and `$ref` definitions. Tips for avoiding errors include keeping schemas focused, making uncertain fields optional, matching schema complexity to the task, and using clear prompts.

## Key Topics

- `outputFormat` / `output_format` option with JSON Schema
- Validated JSON output from multi-turn agent workflows
- Zod integration with `z.toJSONSchema()` for TypeScript type safety
- Pydantic integration with `.model_json_schema()` for Python type safety
- `structured_output` field on `ResultMessage`
- `error_max_structured_output_retries` error subtype
- Schema validation with automatic re-prompting on mismatch
- TODO tracking agent example combining tools with structured output
- Supported JSON Schema features and limitations
- No streaming support for structured output
- Best practices: focused schemas, optional fields, clear prompts
