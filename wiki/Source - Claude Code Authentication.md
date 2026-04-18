---
title: "Source - Claude Code Authentication"
type: source
date: 2026-04-13
source_file: "raw/authentication.md"
tags: [claude-code, enterprise, security]
---

# Source - Claude Code Authentication

[[Claude Code]] supports multiple authentication methods that cover individual users, teams, and automated pipelines. On first launch, Claude Code opens a browser window for OAuth login. Individual users authenticate with Claude Pro, Max, Teams, or Enterprise subscriptions via claude.ai OAuth. Console users authenticate with API credentials after an admin invite. Cloud provider users ([[Amazon Bedrock]], [[Google Vertex AI]], [[Microsoft Foundry]]) set required environment variables before running `claude` and skip browser login entirely.

Credential storage varies by OS. On macOS, credentials are stored in the encrypted macOS Keychain. On Linux and Windows, credentials are stored in `~/.claude/.credentials.json` (or under `$CLAUDE_CONFIG_DIR`); on Linux the file is written with mode `0600`, and on Windows it inherits the user profile directory's access controls. A custom `apiKeyHelper` shell script setting can return dynamic or rotating credentials such as short-lived vault tokens; it is called after 5 minutes or on HTTP 401 by default, with `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` for custom intervals. If the helper takes more than 10 seconds, a warning is shown in the prompt bar.

Authentication precedence (highest to lowest) when multiple credentials are present: (1) cloud provider credentials when `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX`, or `CLAUDE_CODE_USE_FOUNDRY` is set; (2) `ANTHROPIC_AUTH_TOKEN` sent as `Authorization: Bearer` (for LLM gateway or proxy setups); (3) `ANTHROPIC_API_KEY` sent as `X-Api-Key` (direct API access from Console); (4) `apiKeyHelper` script output (dynamic/rotating credentials); (5) `CLAUDE_CODE_OAUTH_TOKEN` long-lived token from `claude setup-token`; (6) subscription OAuth from `/login` (default for Pro, Max, Teams, Enterprise). Note that `apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` apply only to terminal CLI sessions; Claude Desktop and remote sessions use OAuth exclusively.

For CI pipelines and non-interactive environments, `claude setup-token` generates a one-year OAuth token that can be set as `CLAUDE_CODE_OAUTH_TOKEN`. This token requires a Pro, Max, Teams, or Enterprise plan, is scoped to inference only, and cannot establish Remote Control sessions. Bare mode (`--bare`) does not read `CLAUDE_CODE_OAUTH_TOKEN`; use `ANTHROPIC_API_KEY` or `apiKeyHelper` for bare mode scripts.

## Key Topics

- Browser OAuth flow on first launch; fallback copy-URL and paste-code flows
- Account types: Pro/Max subscription, Teams, Enterprise, Console, cloud providers
- Credential storage by OS: macOS Keychain, Linux/Windows `~/.claude/.credentials.json`
- `apiKeyHelper` for dynamic/rotating credentials with configurable TTL
- Authentication precedence order (6 levels, cloud provider > OAuth token)
- `ANTHROPIC_AUTH_TOKEN` for LLM gateway bearer token auth
- `ANTHROPIC_API_KEY` for direct Console API key usage
- `CLAUDE_CODE_OAUTH_TOKEN` for long-lived CI/CD token via `claude setup-token`
- Team setup paths: Teams/Enterprise (recommended), Console, Bedrock, Vertex, Foundry
- Claude Console role assignments: Claude Code role vs. Developer role
- apiKeyHelper and API key env vars apply to CLI only; remote sessions use OAuth
- Bare mode (`--bare`) incompatibility with `CLAUDE_CODE_OAUTH_TOKEN`
