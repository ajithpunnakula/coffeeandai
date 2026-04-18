---
title: "Source - Work with Sessions"
type: source
date: 2026-04-17
source_file: "raw/work-with-sessions.md"
tags: [agent-sdk, sessions, resume, fork, conversation-management]
---

This source from the [[Claude Code]] official documentation explains how sessions persist agent conversation history in the [[Agent SDK]] and when to use continue, resume, and fork to return to a prior run. A session contains the prompt, every tool call, every tool result, and every response, written to disk automatically so the agent can return with full context.

The document presents a decision matrix for session handling: one-shot tasks need nothing extra (one `query()` call), multi-turn chat in one process uses `ClaudeSDKClient` (Python) or `continue: true` (TypeScript) for automatic session tracking, picking up after a process restart uses `continue_conversation=True` / `continue: true` to resume the most recent session, resuming a specific past session requires capturing and passing a session ID to `resume`, trying alternatives without losing the original uses fork, and stateless tasks can set `persistSession: false` (TypeScript only) to keep the session in memory only.

Continue and resume both pick up existing sessions but differ in how they find them. Continue finds the most recent session in the current directory without tracking IDs, working well for single-conversation apps. Resume takes a specific session ID, required for multiple sessions (e.g., one per user in a multi-user app) or returning to non-recent sessions. Fork creates a new session starting with a copy of the original's history while leaving the original unchanged, useful for exploring alternative approaches.

Session IDs are captured from `ResultMessage` (present on every result regardless of success/error). In TypeScript, the ID is also available earlier on the init `SystemMessage`. Sessions are stored under `~/.claude/projects/<encoded-cwd>/*.jsonl` where `<encoded-cwd>` is the absolute working directory with non-alphanumeric characters replaced by `-`.

For resuming across hosts (CI workers, ephemeral containers, serverless), two options are presented: moving the session file to the same path on the new host, or capturing results as application state and passing them into fresh session prompts. Both SDKs expose `listSessions()`, `getSessionMessages()`, `getSessionInfo()`, `renameSession()`, and `tagSession()` functions for session management.

The document notes that forking branches conversation history, not the filesystem -- if a forked agent edits files, those changes are real. For branching and reverting file changes, [[Checkpointing]] should be used instead.

## Key Topics
- Sessions as persistent conversation history (prompts, tool calls, results, responses)
- Continue: automatic most-recent session resumption without ID tracking
- Resume: specific session ID required for targeted session recovery
- Fork: new session with copied history, original unchanged
- `ClaudeSDKClient` (Python) for automatic multi-turn session management
- `continue: true` (TypeScript) for session continuation
- Session ID capture from `ResultMessage.session_id`
- Session storage at `~/.claude/projects/<encoded-cwd>/*.jsonl`
- `persistSession: false` for in-memory-only sessions (TypeScript)
- Cross-host session resume via file transfer or state capture
- `listSessions()`, `getSessionMessages()`, `renameSession()`, `tagSession()` utilities
- Fork branches conversation only, not filesystem (use [[Checkpointing]] for files)
