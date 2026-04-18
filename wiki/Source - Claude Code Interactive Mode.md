---
title: "Source - Claude Code Interactive Mode"
type: source
date: 2026-04-13
source_file: "raw/interactive-mode.md"
tags: [claude-code, features]
---

# Source - Claude Code Interactive Mode

[[Claude Code]]'s interactive mode provides a rich terminal interface with multiple input mechanisms designed to streamline coding workflows. The interface supports a Vim editor mode for users who prefer modal text editing, as well as a bash mode activated with the `!` prefix for running shell commands directly from the prompt. Background bash execution via `Ctrl+B` allows commands to run without blocking the conversation.

The interface includes prompt suggestions and a `/btw` command for asking side questions without disrupting the main task context. Task lists provide structured progress tracking across multi-step operations. PR review status display integrates pull request feedback directly into the interactive session, reducing context-switching.

Platform-specific behavior is noted for macOS users, where Option-as-Meta must be configured in terminal settings to enable certain keyboard shortcuts. These shortcuts are further customizable via [[Source - Claude Code Keyboard Shortcuts|Claude Code Keyboard Shortcuts]], giving users fine-grained control over the interactive experience.

## Key Topics

- Vim editor mode for modal text input
- Background bash execution (Ctrl+B)
- Bash mode via `!` prefix
- Prompt suggestions and autocomplete
- `/btw` side questions without losing context
- Task lists for multi-step tracking
- PR review status display
- macOS Option-as-Meta configuration
