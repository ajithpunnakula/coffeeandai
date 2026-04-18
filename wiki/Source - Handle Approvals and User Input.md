---
title: "Source - Handle Approvals and User Input"
type: source
date: 2026-04-17
source_file: "raw/handle-approvals-and-user-input.md"
tags: [agent-sdk, permissions, user-input, approvals]
---

This source documents how to handle tool approval requests and clarifying questions within the [[Agent SDK]]. Claude requests user input in two situations: when it needs permission to use a tool (like deleting files or running commands) and when it has clarifying questions via the `AskUserQuestion` tool. Both trigger a `canUseTool` callback that pauses execution until a response is returned.

The `canUseTool` callback receives three arguments: the tool name, the input parameters (tool-specific, such as `command` for Bash or `file_path` and `content` for Write), and a context/options object. The callback can return either an allow response (with optionally modified input) or a deny response (with a message explaining why). This enables several interaction patterns: approve as-is, approve with modifications (e.g., sandboxing paths), reject with explanation, suggest alternatives, or redirect entirely using streaming input.

The `AskUserQuestion` tool enables Claude to ask clarifying questions with multiple-choice options. Each question includes a `question` text, a `header` label, 2-4 `options` with labels and descriptions, and a `multiSelect` flag. In TypeScript, the `toolConfig.askUserQuestion.previewFormat` setting can enable visual previews (markdown or HTML) alongside options. Responses map question text to selected option labels, with support for free-text input when predefined options are insufficient.

The document notes important limitations: `AskUserQuestion` is not available in [[Subagents]], and each call supports 1-4 questions with 2-4 options each. In Python, the `can_use_tool` callback requires streaming mode and a `PreToolUse` hook that returns `{"continue_": True}` to keep the stream open. The source also mentions [[Hooks]] as an alternative for automatically allowing or denying tools without prompting users.

## Key Topics

- `canUseTool` callback handles both tool approvals and clarifying questions
- Two request types: tool permission requests and `AskUserQuestion` clarification
- Response options: allow (with optional input modification), deny (with message), redirect
- `AskUserQuestion` provides structured multiple-choice questions with 2-4 options
- TypeScript supports `previewFormat` for visual option previews (markdown or HTML)
- Free-text input supported alongside predefined options
- Python requires streaming mode and a dummy `PreToolUse` hook for `can_use_tool`
- `AskUserQuestion` not available in [[Subagents]]; limited to 1-4 questions per call
- [[Hooks]] can auto-approve or deny tools without user prompts
- Plan mode in [[Permission Modes]] frequently triggers clarifying questions
