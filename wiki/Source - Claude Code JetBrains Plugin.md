---
title: "Source - Claude Code JetBrains Plugin"
type: source
date: 2026-04-13
source_file: "raw/jetbrains-ides.md"
tags: [claude-code, ide-integration]
---

# Source - Claude Code JetBrains Plugin

[[Claude Code]] integrates with [[JetBrains Plugin]] IDEs through a dedicated plugin available in the JetBrains Marketplace. Supported IDEs include IntelliJ IDEA, PyCharm, WebStorm, Android Studio, PhpStorm, and GoLand. The plugin bridges the running Claude Code CLI session with the IDE, enabling richer interactions than a plain terminal provides.

Key features include: quick launch via `Cmd+Esc` / `Ctrl+Esc`; diff viewing directly in the IDE's native diff viewer instead of the terminal; automatic sharing of the current file selection and active tab as context; file reference shortcuts (`Cmd+Option+K` / `Alt+Ctrl+K`) that insert `@File#L1-99` style references into the prompt; and automatic diagnostic sharing (lint errors, syntax issues) from the IDE as the user works. The plugin connects to a running CLI session — either from the IDE's integrated terminal (`claude`) or an external terminal using `/ide`.

Configuration lives in **Settings → Tools → Claude Code [Beta]** and covers the Claude command path (useful for custom installs or WSL), Option+Enter multi-line behavior, and automatic update checks. Two special configurations require attention: for Remote Development, the plugin must be installed on the remote host (not the local client) via **Settings → Plugin (Host)**; for WSL users, the Claude command should be set to `wsl -d Ubuntu -- bash -lic "claude"` and additional networking/firewall adjustments may be needed for IDE detection to work.

Security considerations mirror those in [[VS Code Extension]]: when auto-edit permissions are enabled, [[Claude Code]] can modify IDE configuration files that the IDE may auto-execute, which can bypass normal permission prompts for Bash execution. Users are advised to prefer manual approval mode and trust only known prompts.

## Key Topics

- Supported IDEs: IntelliJ, PyCharm, WebStorm, Android Studio, PhpStorm, GoLand
- Quick launch shortcut (`Cmd+Esc` / `Ctrl+Esc`)
- Native diff viewer integration for code change review
- Automatic selection and tab context sharing with the CLI session
- File reference shortcut (`Cmd+Option+K`) for `@File#L1-99` syntax
- Diagnostic sharing (lint/syntax errors) from the IDE
- `/ide` command to connect external terminal sessions
- Plugin Settings: custom Claude command path, ESC key configuration, auto-updates
- Remote Development: must install plugin on remote host, not local client
- WSL configuration: special command format and networking requirements
- Security: auto-edit mode can modify IDE config files, bypassing permission prompts
