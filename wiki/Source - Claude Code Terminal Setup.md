---
title: "Source - Claude Code Terminal Setup"
type: source
date: 2026-04-13
source_file: "raw/optimize-your-terminal-setup.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Terminal Setup

[[Claude Code]] works best with a properly configured terminal. Several terminals support Shift+Enter for multi-line input natively without any configuration: iTerm2, WezTerm, Ghostty, and Kitty. For VS Code, Alacritty, Zed, and Warp, the `/terminal-setup` command can automatically configure Shift+Enter. Alternative line break methods that work everywhere are `\` followed by Enter (quick escape) and `Ctrl+J` (line feed character). Option+Enter can be configured as an alternative on macOS Terminal.app (via "Use Option as Meta Key") and iTerm2 (set Left/Right Option key to "Esc+") and VS Code (`terminal.integrated.macOptionIsMeta: true`).

Desktop notifications fire when [[Claude Code]] finishes and is waiting for input. Kitty and Ghostty support these natively. iTerm2 requires enabling "Notification Center Alerts" and "Send escape sequence-generated alerts" in its settings. When running inside **tmux**, notifications and the terminal progress bar only reach the outer terminal if `set -g allow-passthrough on` is added to the tmux config; without it, tmux intercepts the escape sequences. Other terminals (including macOS Terminal) do not support native notifications and should use [[Hooks|notification hooks]] instead.

Flicker during long sessions or terminal scroll position jumping can be resolved by enabling **fullscreen rendering** (`CLAUDE_CODE_ENABLE_TELEMETRY`... specifically `CLAUDE_CODE_NO_FLICKER=1`), which uses an alternate rendering path that keeps memory flat and adds mouse support. The `/fullscreen` command or `CLAUDE_CODE_NO_FLICKER=1` environment variable enables it. For large inputs, direct pasting is unreliable—file-based workflows (write to a file, ask Claude to read it) are recommended. The VS Code terminal is noted as particularly prone to truncating long pastes.

Vim keybinding mode is available and supports a comprehensive subset of Vim commands including mode switching (Normal/Insert), navigation (`h/j/k/l`, word motions, `gg`/`G`), editing operators (`d`, `c`, `y`, `p`), text objects (`iw`, `aw`, `i"`, `i(`, etc.), indentation (`>>`/`<<`), `.` repeat, and `J` join. It is enabled via `/config` → Editor mode or by setting `editorMode: "vim"` in `~/.claude.json`. Theme and appearance are controlled by the terminal application itself, not [[Claude Code]]; `/config` provides matching options for Claude Code's own UI.

## Key Topics

- Line break methods: Shift+Enter (native in iTerm2/WezTerm/Ghostty/Kitty), `/terminal-setup` for others, `\`+Enter, Ctrl+J
- Option+Enter configuration for macOS Terminal.app, iTerm2, VS Code
- Desktop notifications: native support in Kitty/Ghostty, iTerm2 configuration steps
- tmux passthrough: `set -g allow-passthrough on` for notifications to reach outer terminal
- Notification hooks as fallback for terminals without native notification support
- Fullscreen rendering (`CLAUDE_CODE_NO_FLICKER=1`) for flicker and memory reduction
- Large input handling: avoid direct pasting, prefer file-based workflows
- VS Code terminal paste truncation limitation
- Vim mode: enabled via `/config` or `editorMode: "vim"`, comprehensive Vim subset supported
- Custom status line for displaying model, directory, git branch
