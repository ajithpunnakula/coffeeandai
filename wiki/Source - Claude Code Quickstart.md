---
title: "Source - Claude Code Quickstart"
type: source
date: 2026-04-13
source_file: "raw/quickstart.md"
tags: [claude-code, getting-started]
---

# Source - Claude Code Quickstart

The [[Claude Code]] Quickstart is an interactive configurator and five-step first-use guide. It walks users through selecting a target surface (Terminal, Desktop, VS Code, JetBrains), choosing an API provider, and getting a working install in the fewest possible steps. The quickstart is interactive on the docs site — it adapts install commands based on platform and provider selection — but the core flow is: install, authenticate, and run `claude` in a project directory.

Installation is available via three methods. The native installer (recommended) runs a single shell command on macOS/Linux/WSL or a PowerShell/CMD one-liner on Windows and auto-updates in the background. Homebrew (`brew install --cask claude-code`) tracks a stable channel roughly one week behind and requires manual `brew upgrade` to update. WinGet (`winget install Anthropic.ClaudeCode`) similarly requires manual upgrade. Windows users must have Git for Windows installed before running the installer.

Supported account types span Anthropic-first-party plans and third-party providers. Anthropic plans include Free, Pro, Max (consumer), Team, and Enterprise (commercial). Third-party inference providers — [[Amazon Bedrock]], [[Google Vertex AI]], and [[Microsoft Foundry]] — each require provider-side setup (IAM credentials, Vertex API enablement, or Azure Foundry resource provisioning) before connecting. The Terminal CLI and VS Code extension support all providers; other surfaces (Desktop App, JetBrains, Web) require an Anthropic subscription. After installing, authentication prompts on first launch with a browser-based OAuth flow for Anthropic accounts or API key entry for Console/provider accounts.

## Key Topics

- Install methods: native installer (auto-updates), Homebrew (manual upgrade), WinGet (manual upgrade)
- Platform coverage: macOS, Linux, WSL, Windows (requires Git for Windows)
- Account types: Free, Pro, Max (consumer); Team, Enterprise (commercial); API/Console
- Third-party providers: [[Amazon Bedrock]], [[Google Vertex AI]], [[Microsoft Foundry]]
- Surfaces: Terminal CLI, Desktop App, VS Code extension, JetBrains plugin, Web
- Provider constraints: Terminal and VS Code support all providers; Desktop/JetBrains/Web require Anthropic subscription
- First-use flow: install → authenticate (OAuth or API key) → `cd project && claude`
- `/init` command for generating a starter [[CLAUDE.md File]]
