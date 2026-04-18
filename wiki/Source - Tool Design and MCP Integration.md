---
title: "Source - Tool Design and MCP Integration"
type: source
date: 2026-04-17
source_file: "raw/tool-design-mcp-integration.md"
tags: [certification, tool-design, mcp, exam-prep]
---

This source is the Domain 2 deep dive for the [[Claude Certified Architect Exam]], covering Tool Design and [[MCP]] Integration at approximately 20% of exam weight. It provides detailed explanations, code examples, and anti-pattern comparisons across five sub-topics.

Section d2.1 covers Tool Description Best Practices, establishing that tool descriptions are the primary mechanism Claude uses to decide when and how to use a tool. Effective descriptions include clear purpose, input specifications with exact types and formats, examples of expected input/output pairs, edge case documentation, and clarity about when not to use the tool. A vague description like "Searches for stuff" forces Claude to guess, while a detailed description with format requirements (E.164 for phone, ACC- prefix for IDs) removes all ambiguity.

Section d2.2 covers Structured Error Responses, introducing the critical distinction between access failures and empty results -- one of the most tested concepts on the exam. Error responses should include four key fields: isError (signals failure), errorCategory (classifies type like auth, not_found, rate_limit), isRetryable (whether retry might succeed), and context (what was attempted and what failed). Returning empty results for a failed database connection is a catastrophic error because the agent incorrectly concludes no data exists.

Section d2.3 covers Tool Distribution and Selection, establishing that 4-5 tools per agent is optimal. With 18+ tools, selection accuracy degrades as Claude must evaluate each against the current task, and similar tools create ambiguity. The solution is distributing tools across specialized [[Subagents]] (customer agent, order agent, communication agent) with a coordinator using the Task tool to delegate. The tool_choice parameter controls selection: "auto" (model decides), "any" (must use a tool), or forced specific tool.

Section d2.4 covers [[MCP]] Server Configuration at two levels: `.mcp.json` for project-level configuration (shared via version control) and `~/.claude.json` for user-level configuration (personal tools). Security requires using `${ENV_VAR}` expansion for secrets rather than hardcoding API keys. MCP servers can provide tools (custom functions), resources (static data), and prompts (pre-built templates).

Section d2.5 covers [[Claude Code]]'s six built-in tools: Read (file contents), Write (create new files), Edit (modify existing files with targeted changes), Bash (shell commands for builds and tests), Grep (search content patterns across files), and Glob (find files by name patterns). Critical distinctions include: Write replaces entire files so Edit should be used for modifications, and Bash should never be used when a dedicated built-in tool exists (e.g., never use `cat` when Read exists).

## Key Topics

- Tool descriptions as documentation for the model with input formats and edge cases
- Structured error responses: isError, errorCategory, isRetryable, context
- Access failure versus empty result distinction (heavily tested on exam)
- 4-5 tools per agent optimal; distribute across [[Subagents]] for larger sets
- tool_choice modes: auto, any, forced specific tool
- [[MCP]] configuration: `.mcp.json` (project) versus `~/.claude.json` (user)
- Environment variable expansion `${ENV_VAR}` for secrets management
- MCP servers provide tools, resources, and prompts
- Six built-in tools: Read, Write, Edit, Bash, Grep, Glob
- Write versus Edit: Write replaces entire files, Edit for targeted changes
- Never use Bash when a dedicated built-in tool exists
