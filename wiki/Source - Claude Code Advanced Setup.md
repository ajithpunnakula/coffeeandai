---
title: "Source - Claude Code Advanced Setup"
type: source
date: 2026-04-13
source_file: "raw/advanced-setup.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Advanced Setup

[[Claude Code]] supports macOS 13.0+, Windows 10 1809+ / Windows Server 2019+, Ubuntu 20.04+, Debian 10+, and Alpine Linux 3.19+, requiring at least 4 GB RAM with an x64 or ARM64 processor and an internet connection. On Windows, Git for Windows is a hard dependency since [[Claude Code]] uses Git Bash internally to run commands. A Pro, Max, Team, or Enterprise [[Anthropic]] account is required; the free Claude.ai plan does not include access. Third-party providers ([[Amazon Bedrock]], [[Google Vertex AI]], [[Microsoft Foundry]]) are also supported as an alternative to direct account authentication.

Three installation methods are available. The **native installer** (recommended) is a single `curl | bash` or PowerShell one-liner that auto-updates in the background and requires no Node.js dependency. **Homebrew** offers `claude-code` (stable channel, ~one week behind) and `claude-code@latest` (latest) casks, but does not auto-update—`brew upgrade` must be run manually. **WinGet** (`winget install Anthropic.ClaudeCode`) similarly requires manual upgrades. The legacy npm installation method (`npm install -g @anthropic-ai/claude-code`) is now deprecated; migration to native involves installing the binary and then running `npm uninstall -g @anthropic-ai/claude-code`. Alpine Linux and musl-based distributions require `libgcc`, `libstdc++`, and `ripgrep` packages plus setting `USE_BUILTIN_RIPGREP=0`.

Release channels can be controlled via the `autoUpdatesChannel` setting (`"latest"` or `"stable"`), toggled through `/config` or `settings.json`. Enterprise deployments can enforce a consistent channel via [[Source - Claude Code Server-Managed Settings|managed settings]]. Specific versions can be pinned at install time by passing a version number or channel name to the install script (e.g., `bash -s 2.1.89`).

Binary integrity is verifiable through GPG-signed release manifests. Each release publishes a `manifest.json` containing SHA256 checksums for every platform binary, signed with Anthropic's GPG key (fingerprint `31DD DE24 DDFA B679 F42D 7BD2 BAA9 29FF 1A7E CACE`). Manifest signatures are available for releases from v2.1.89 onward. Platform-native code signatures are also provided: macOS binaries are signed by "Anthropic PBC" and notarized by Apple; Windows binaries are signed by "Anthropic, PBC"; Linux uses manifest verification only.

## Key Topics

- System requirements: OS versions, hardware minimums, network, shell, Git for Windows dependency
- Three installation methods: native (recommended), Homebrew, WinGet
- Deprecated npm installation and migration path to native binary
- Alpine/musl setup: required packages and `USE_BUILTIN_RIPGREP=0` flag
- Auto-update behavior: native auto-updates vs. manual Homebrew/WinGet upgrades
- Release channels: `latest` vs. `stable` via `autoUpdatesChannel` setting
- Version pinning: installing specific versions via the native installer
- Binary integrity: GPG-signed manifest verification, platform code signatures (macOS/Windows)
- Uninstallation instructions for each installation method
