---
title: "Checkpointing"
type: concept
tags: [claude-code, session-management, safety]
sources: ["raw/checkpointing.md", "raw/how-claude-code-works.md", "raw/rewind-file-changes-with-checkpointing.md"]
---

# Checkpointing

[[Claude Code]]'s automatic per-prompt file state snapshot system. Before Claude edits any file, it snapshots the current contents. This allows reverting to any prior state without relying on git.

## How it works

- Every user prompt creates a new checkpoint
- Only changes made by Claude's **file editing tools** are tracked — bash commands (`rm`, `mv`, `cp`) are not captured
- External edits made outside of Claude Code (manual edits, other sessions) are not tracked unless they happen to touch files the current session has also edited
- Checkpoints persist across sessions (survive closing the terminal and resuming)
- Automatically cleaned up after 30 days (configurable)

## Rewind menu

Press `Esc` twice (`Esc+Esc`) or run `/rewind` to open the rewind menu. A scrollable list shows each prompt from the session. Select a point and choose an action:

| Action | Effect |
|---|---|
| **Restore code and conversation** | Reverts both file state and conversation history to that point |
| **Restore conversation** | Rewinds conversation only; current code is unchanged |
| **Restore code** | Reverts file changes only; conversation stays as-is |
| **Summarize from here** | Compresses messages from the selected point forward into a compact AI summary, freeing context window space without reverting files |
| **Never mind** | Returns to the message list without changes |

After restore or summarize, the original prompt from the selected message is restored to the input field for re-sending or editing.

## Summarize vs. restore

Restore options revert state. "Summarize from here" is different: messages before the selected point stay intact; the selected message and all subsequent messages are replaced with an AI-generated summary. Original messages are preserved in the session transcript so Claude can reference details if needed. This is a targeted version of `/compact` — useful to compress a verbose debugging subsection while keeping early context in full detail.

To branch off and try a different approach while preserving the original session, use **fork** (`claude --continue --fork-session`) instead.

## Limitations

- **Bash command changes not tracked**: file modifications from shell commands cannot be undone through rewind
- **Not a replacement for git**: checkpoints are session-level "local undo"; git remains the permanent history
- **External edits not tracked**: manual changes or edits from other concurrent sessions are not captured

## Relationship to git

The recommended mental model: checkpoints are "local undo" for active experimentation; git is "permanent history" for collaboration and long-term reference. Use checkpoints freely to try risky approaches — if something breaks, rewind. Commit to git when you reach a state worth keeping.

See also: [[Claude Code]], [[Source - Claude Code Checkpointing]]