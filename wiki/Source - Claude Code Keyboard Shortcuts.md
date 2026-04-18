---
title: "Source - Claude Code Keyboard Shortcuts"
type: source
date: 2026-04-13
source_file: "raw/customize-keyboard-shortcuts.md"
tags: [claude-code, features, configuration]
---

# Source - Claude Code Keyboard Shortcuts

[[Claude Code]] keyboard shortcuts are defined in `~/.claude/keybindings.json`, using a structured format that maps key combinations to named actions within specific contexts. The reference documents 20 named contexts — including Global, Chat, Autocomplete, and Transcript — each containing their own set of bindable actions. Actions follow a `namespace:action` format (e.g., `chat:submit`, `global:quit`) that scopes bindings to their relevant interface layer.

Chord bindings are supported, allowing sequential key presses (e.g., pressing `g` then `g`) to trigger an action, similar to Vim-style multi-key shortcuts. This enables complex shortcut schemes for power users without requiring simultaneous key combinations. Chord bindings are defined by specifying a sequence of keys in the binding configuration.

Three keys are reserved and cannot be rebound: `Ctrl+C` (interrupt), `Ctrl+D` (EOF/exit), and `Ctrl+M` (Enter/submit). Vim mode, when enabled via [[Source - Claude Code Interactive Mode|Claude Code Interactive Mode]], interacts with the keybinding system — some bindings may behave differently or be suppressed in Vim's insert vs. normal modes. Keybinding changes are detected and applied automatically without requiring a restart of [[Claude Code]].

## Key Topics

- Configuration file: `~/.claude/keybindings.json`
- 20 named contexts (Global, Chat, Autocomplete, Transcript, etc.)
- `namespace:action` format for action identifiers
- Chord bindings (sequential key presses)
- Reserved keys: Ctrl+C, Ctrl+D, Ctrl+M
- Vim mode interaction with keybindings
- Auto-detected without restart
- Relationship to [[Source - Claude Code Interactive Mode|Claude Code Interactive Mode]] Vim editor mode
