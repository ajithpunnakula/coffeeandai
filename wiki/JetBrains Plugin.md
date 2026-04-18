---
title: "JetBrains Plugin"
type: entity
tags: [tool, ide]
sources: ["raw/jetbrains-ides.md", "raw/platforms-and-integrations.md"]
---

# JetBrains Plugin

The JetBrains Plugin brings [[Claude Code]] into IntelliJ IDEA, PyCharm, WebStorm, Android Studio, and other JetBrains IDEs. Unlike the [[VS Code Extension]], which runs Claude Code directly inside the editor process, the JetBrains Plugin connects to a running [[Claude Code]] CLI session via the `/ide` command, bridging the terminal and the IDE over a local socket.

Key capabilities include inline diff viewing within the IDE diff tool, selection-context sharing (sending highlighted code to the active Claude session), file reference keyboard shortcuts, and diagnostic sharing that forwards IDE error and warning annotations to Claude. This allows Claude to act on language-server diagnostics without the user manually copying error output.

The plugin requires additional configuration in two specialized environments. For JetBrains Remote Development (Gateway or Code With Me), users must configure the plugin on the remote host rather than the local client. For Windows Subsystem for Linux (WSL) setups, the CLI must run inside WSL while the IDE runs on Windows, and the plugin must be told which WSL distribution to connect to. See [[Source - Claude Code JetBrains Plugin]] for full setup steps.
