---
title: "Source - Claude Code Model Configuration"
type: source
date: 2026-04-13
source_file: "raw/model-configuration.md"
tags: [claude-code, configuration]
---

# Source - Claude Code Model Configuration

[[Claude Code]] provides a flexible model selection system built around named aliases that always point to the latest version of each model family. The primary aliases are `sonnet` (Sonnet 4.6, daily coding), `opus` / `best` (Opus 4.6, complex reasoning), `haiku` (fast, simple tasks), `opusplan` (Opus during plan mode, Sonnet during execution—a hybrid approach), and `[1m]` suffix variants for 1 million token context windows (e.g., `opus[1m]`, `sonnet[1m]`). A special `default` value clears any override and reverts to the account-tier default: Opus 4.6 for Max and Team Premium, Sonnet 4.6 for Pro and Team Standard. Model can be set in priority order via `/model` in-session, `--model` at startup, `ANTHROPIC_MODEL` environment variable, or the `model` field in `settings.json`.

Enterprise administrators can restrict the model picker using `availableModels` in managed settings, which filters which named models users can switch to. To fully pin model behavior, three settings must be combined: `availableModels` (restricts the picker), `model` (sets the initial selection), and the `ANTHROPIC_DEFAULT_SONNET_MODEL` / `ANTHROPIC_DEFAULT_OPUS_MODEL` / `ANTHROPIC_DEFAULT_HAIKU_MODEL` environment variables (controls what each alias resolves to, including the Default option). Without the env vars, a user selecting Default can bypass version pins. The `modelOverrides` setting provides fine-grained mapping from Anthropic model IDs to provider-specific ARNs or deployment names for [[Amazon Bedrock]], [[Google Vertex AI]], and [[Microsoft Foundry]] governance.

Effort levels control adaptive reasoning for supported models (Opus 4.6 and Sonnet 4.6): `low`, `medium`, `high`, and `max` (Opus 4.6 only, not session-persistent). Pro and Max users default to medium; API, Team, and Enterprise users default to high. Effort can be set via `/effort`, the `--effort` flag, `CLAUDE_CODE_EFFORT_LEVEL` env var, the `effortLevel` settings key, or skill/subagent frontmatter. Including "ultrathink" in a prompt triggers high effort for that turn. Adaptive reasoning can be disabled entirely with `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`.

The 1M token context window is available on Opus 4.6 and Sonnet 4.6. On Max, Team, and Enterprise plans, Opus is automatically upgraded to 1M context with no additional configuration. Sonnet 1M requires extra usage on most plans. Extended context can be disabled with `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`. Prompt caching is enabled by default and can be disabled globally (`DISABLE_PROMPT_CACHING=1`) or per model tier (`DISABLE_PROMPT_CACHING_HAIKU`, `_SONNET`, `_OPUS`).

## Key Topics

- Model aliases: `sonnet`, `opus`, `best`, `haiku`, `opusplan`, `[1m]` suffix, `default`
- Four-level model selection priority: in-session > startup flag > env var > settings file
- Enterprise model restriction: `availableModels`, `model`, and `ANTHROPIC_DEFAULT_*_MODEL` triple combination
- `modelOverrides` for mapping Anthropic model IDs to provider-specific ARNs/deployment names
- `opusplan` hybrid mode: Opus for planning, Sonnet for execution
- Effort levels: `low`, `medium`, `high`, `max` (adaptive reasoning control)
- `ultrathink` prompt keyword for one-off high-effort turns
- 1M context window: plan availability, `[1m]` alias suffix, `CLAUDE_CODE_DISABLE_1M_CONTEXT`
- Prompt caching configuration: global and per-model-tier disable flags
- Third-party provider model pinning: Bedrock ARNs, Vertex version names, Foundry deployment names
