---
title: "Source - Claude Code Troubleshooting"
type: source
date: 2026-04-13
source_file: "raw/troubleshooting.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Troubleshooting

The [[Claude Code]] Troubleshooting guide is a diagnostic reference organized around specific error messages and symptoms. It opens with a quick-lookup table mapping 15+ error patterns to their solutions, covering the most common installation and usage failures. The guide is structured for fast triage: find the error, jump to the fix. Issues covered span macOS, Linux, Windows, WSL, and Docker environments.

Installation issues form the bulk of the guide. PATH problems (`command not found: claude`) are the most common: the installer places the binary at `~/.local/bin/claude` on macOS/Linux or `%USERPROFILE%\.local\bin\claude.exe` on Windows, and if those directories are not in PATH, the binary is unreachable. The fix is adding the appropriate directory to the shell config (`.zshrc`, `.bashrc`, or Windows system environment variables). On Linux, binary architecture mismatches (musl vs. glibc variants) cause `Error loading shared library` errors — the correct variant must be installed for the distribution. On Windows, shell confusion between PowerShell and CMD causes `&&` syntax errors; users must use the correct command for their shell. Windows also requires Git for Windows to be installed; its absence produces a specific error.

Network and TLS issues arise in corporate environments: TLS/SSL certificate errors typically require installing or trusting a corporate CA certificate, and traffic to `storage.googleapis.com` (used by the installer) may be blocked by corporate firewalls. The fix involves setting `HTTPS_PROXY` and `HTTP_PROXY` environment variables before installation or configuring system certificate stores. Authentication failures cover OAuth errors (browser-based login), 403 Forbidden (API key or account issue), and expired tokens (requiring re-login). Repeated permission prompts can be resolved by allowlisting trusted commands in `.claude/settings.json`.

WSL-specific issues are documented separately: WSL has its own PATH environment that may not include Windows-installed tools, and clipboard/display integration requires specific configuration. Docker usage requires explicit volume mounts and environment variable forwarding. Config file locations are documented for resetting corrupted state: `~/.claude/` for Unix-style systems, `%APPDATA%\Claude\` on Windows.

## Key Topics

- Quick-lookup error table: 15+ error patterns mapped to solutions
- PATH setup: `~/.local/bin` on macOS/Linux, `%USERPROFILE%\.local\bin` on Windows
- Linux binary variants: musl vs. glibc mismatch causing shared library errors
- Windows shell confusion: PowerShell vs. CMD syntax differences
- Git for Windows requirement on Windows platform
- TLS/SSL certificate errors: corporate CA configuration, `HTTPS_PROXY` setup
- Network diagnostics: verifying access to `storage.googleapis.com`
- Auth failures: OAuth errors, 403 Forbidden, expired token re-login
- Repeated permission prompts: allowlisting commands in `.claude/settings.json`
- WSL-specific issues: PATH, clipboard, display configuration
- Docker: volume mounts and environment variable forwarding
- Config file locations for reset: `~/.claude/` (Unix), `%APPDATA%\Claude\` (Windows)
- `/doctor` command for automated diagnostics
