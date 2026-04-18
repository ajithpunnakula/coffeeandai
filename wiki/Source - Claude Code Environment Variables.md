---
title: "Source - Claude Code Environment Variables"
type: source
date: 2026-04-13
source_file: "raw/environment-variables.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Environment Variables

[[Claude Code]] exposes a large set of environment variables that control all aspects of its behavior. Variables can be set in the shell before launching `claude`, or declared under the `env` key in `settings.json` to apply them persistently or roll them out across a team. API authentication is handled by `ANTHROPIC_API_KEY` (sent as `X-Api-Key`), `ANTHROPIC_AUTH_TOKEN` (custom `Authorization: Bearer` value), and `ANTHROPIC_BASE_URL` (proxy or gateway endpoint override). Provider-specific auth variables cover [[Amazon Bedrock]] (`AWS_BEARER_TOKEN_BEDROCK`, `ANTHROPIC_BEDROCK_BASE_URL`), [[Google Vertex AI]] (`ANTHROPIC_VERTEX_PROJECT_ID`, `ANTHROPIC_VERTEX_BASE_URL`), and [[Microsoft Foundry]] (`ANTHROPIC_FOUNDRY_API_KEY`, `ANTHROPIC_FOUNDRY_BASE_URL`/`ANTHROPIC_FOUNDRY_RESOURCE`).

Model selection variables include `ANTHROPIC_MODEL` (the active model or alias), and the three family-level pinning variables `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, and `ANTHROPIC_DEFAULT_HAIKU_MODEL`. Each supports companion `_NAME`, `_DESCRIPTION`, and `_SUPPORTED_CAPABILITIES` variables for display and feature declaration on third-party providers. `ANTHROPIC_CUSTOM_MODEL_OPTION` adds a single custom entry to the model picker without replacing built-in aliases. Subagent model is controlled separately with `CLAUDE_CODE_SUBAGENT_MODEL`.

Feature flags follow a `CLAUDE_CODE_DISABLE_*` pattern: `CLAUDE_CODE_DISABLE_1M_CONTEXT` removes extended context variants, `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` reverts to fixed thinking budgets, `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` disables backgrounding, `CLAUDE_CODE_DISABLE_CRON` stops scheduled tasks, `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` disables the `/rewind` command, `CLAUDE_CODE_DISABLE_CLAUDE_MDS` prevents loading any [[CLAUDE.md File]] files, and `CLAUDE_CODE_DISABLE_AUTO_MEMORY` disables auto memory. mTLS mutual authentication is configured via `CLAUDE_CODE_CLIENT_CERT`, `CLAUDE_CODE_CLIENT_KEY`, and `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE`. Observability and telemetry are controlled by `CLAUDE_CODE_ENABLE_TELEMETRY`, `OTEL_METRICS_EXPORTER`, and related OpenTelemetry variables.

Effort level for adaptive reasoning is set with `CLAUDE_CODE_EFFORT_LEVEL` (`low`, `medium`, `high`, `max`, or `auto`). Context compaction behavior is tuned with `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (trigger threshold as a percentage) and `CLAUDE_CODE_AUTO_COMPACT_WINDOW` (override the context window size used for compaction calculations). The `CLAUDECODE` variable (value `1`) is set in shells spawned by [[Claude Code]] itself, allowing scripts to detect that context. `CLAUDE_CODE_NO_FLICKER` enables fullscreen rendering to reduce terminal flicker.

## Key Topics

- API authentication: `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`
- Provider-specific variables: Bedrock, Vertex AI, Foundry base URLs and auth tokens
- Model selection and pinning: `ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_*_MODEL` family variables
- `ANTHROPIC_CUSTOM_MODEL_OPTION` for adding gateway-specific models to the picker
- Feature flag pattern (`CLAUDE_CODE_DISABLE_*`) for disabling individual capabilities
- mTLS support: `CLAUDE_CODE_CLIENT_CERT`, `CLAUDE_CODE_CLIENT_KEY`, passphrase
- Telemetry/observability: `CLAUDE_CODE_ENABLE_TELEMETRY`, OpenTelemetry exporter variables
- Effort level control: `CLAUDE_CODE_EFFORT_LEVEL`
- Context compaction tuning: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW`
- `CLAUDECODE` sentinel variable for detecting Claude-spawned shell environments
