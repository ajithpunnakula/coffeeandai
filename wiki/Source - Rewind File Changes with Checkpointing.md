---
title: "Source - Rewind File Changes with Checkpointing"
type: source
date: 2026-04-17
source_file: "raw/rewind-file-changes-with-checkpointing.md"
tags: [checkpointing, agent-sdk, file-management, sessions, undo]
---

This source from the [[Claude Code]] official documentation describes file checkpointing in the [[Agent SDK]], a feature that tracks file modifications made through the Write, Edit, and NotebookEdit tools during an agent session, allowing files to be rewound to any previous state. The document provides complete implementation examples in both Python and TypeScript.

[[Checkpointing]] works by creating backups of files before modifying them through supported tools. User messages in the response stream include a checkpoint UUID that serves as a restore point. The system tracks files created during the session, files modified during the session, and the original content of modified files. When rewinding to a checkpoint, created files are deleted and modified files are restored. An important limitation is that changes made through Bash commands (like `echo > file.txt` or `sed -i`) are not captured.

Implementation requires three steps: enabling checkpointing in SDK options (`enable_file_checkpointing=True` in Python, `enableFileCheckpointing: true` in TypeScript), capturing checkpoint UUIDs from the response stream via user message UUIDs (requires `replay-user-messages` extra arg), and calling `rewind_files()` (Python) or `rewindFiles()` (TypeScript) with a checkpoint UUID. File rewinding restores files on disk but does not rewind the conversation history or context.

The document presents two common patterns: checkpoint before risky operations (keeping only the most recent checkpoint UUID, rewinding immediately if something goes wrong) and multiple restore points (storing all checkpoint UUIDs in an array with metadata for granular rewind). For the multiple restore points pattern, each checkpoint is stored with a description and timestamp for tracking.

To rewind after a stream completes, the session must be resumed with an empty prompt before calling the rewind function, since the connection to the CLI process closes when the loop completes. The CLI also supports rewinding via `claude -p --resume <session-id> --rewind-files <checkpoint-uuid>`.

Key limitations include: only Write/Edit/NotebookEdit tool changes are tracked (not Bash), checkpoints are tied to the session that created them, only file content is tracked (not directory operations), and only local files are supported.

## Key Topics
- [[Checkpointing]] for tracking and reverting file modifications in [[Agent SDK]]
- Write, Edit, and NotebookEdit tools as the only tracked modification tools
- Checkpoint UUIDs from user messages in the response stream
- `enable_file_checkpointing` option and `replay-user-messages` extra arg
- `rewind_files()` / `rewindFiles()` methods for restoring files
- Checkpoint before risky operations pattern (single latest checkpoint)
- Multiple restore points pattern (array of checkpoints with metadata)
- Session resume with empty prompt required for post-stream rewind
- CLI rewind via `--resume` and `--rewind-files` flags
- Bash command changes not captured by checkpoint system
- File content only: directory operations not undone by rewinding
