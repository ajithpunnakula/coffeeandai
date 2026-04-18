---
title: "Source - Todo Lists"
type: source
date: 2026-04-17
source_file: "raw/todo-lists.md"
tags: [agent-sdk, todo-tracking, task-management, progress-tracking]
---

This source from the [[Claude Code]] official documentation describes the built-in todo tracking functionality in the [[Agent SDK]], which provides structured task management and progress display during agent sessions.

Todos follow a predictable lifecycle: they are created as `pending` when tasks are identified, activated to `in_progress` when work begins, completed when the task finishes successfully, and removed when all tasks in a group are completed. The SDK automatically creates todos for complex multi-step tasks requiring 3 or more distinct actions, user-provided task lists with multiple items, non-trivial operations benefiting from progress tracking, and explicit user requests for todo organization.

The document provides two implementation examples. The first shows monitoring todo changes by intercepting `TodoWrite` tool use blocks in the message stream. When the agent uses the `TodoWrite` tool, the application can extract the todo list and display status updates with icons for completed, in-progress, and pending states.

The second example demonstrates a `TodoTracker` class pattern for real-time progress display. The tracker maintains a list of todos, calculates completion statistics, and renders a progress view showing completed count, in-progress count, and individual task status. In-progress todos display their `activeForm` text (describing what is currently happening) while other todos show their `content` text.

Both Python and TypeScript implementations are provided, using `AssistantMessage` / `ToolUseBlock` types in Python and message type checking in TypeScript. The examples show integration with the `query()` function using `maxTurns` configuration to limit agent iterations.

## Key Topics
- Built-in todo tracking in the [[Agent SDK]] via `TodoWrite` tool
- Todo lifecycle: `pending`, `in_progress`, `completed`, removed
- Automatic todo creation for complex multi-step tasks (3+ actions)
- `TodoWrite` tool use blocks in the message stream
- `activeForm` text for in-progress tasks vs `content` for static description
- `TodoTracker` class pattern for real-time progress display
- Python (`ClaudeSDKClient`, `AssistantMessage`, `ToolUseBlock`) implementation
- TypeScript (`query()`, message type checking) implementation
- `maxTurns` configuration for limiting agent iterations
