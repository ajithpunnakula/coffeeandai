---
title: "Source - Claude Code Data Usage"
type: source
date: 2026-04-13
source_file: "raw/data-usage.md"
tags: [claude-code, privacy]
---

# Source - Claude Code Data Usage

[[Claude Code]] data policies differ significantly by account type, and this page is the authoritative reference for those differences. The core distinction is between consumer users (Free, Pro, Max plans) and commercial users (Team, Enterprise, API, and third-party platforms). Consumer users may have their data used for model training when the opt-in setting is enabled; commercial users are not trained on by default, unless they have explicitly joined the Development Partner Program.

Data retention periods follow the training policy split. Consumer users who allow model improvement data use: 5-year retention. Consumer users who do not: 30-day retention. Commercial users: 30-day standard retention, or [[Zero Data Retention]] for Claude for Enterprise organizations (enabled per-org by [[Anthropic]]). Session quality surveys (the "How is Claude doing?" prompt) collect only a numeric rating — no conversation data — and responses do not affect training preferences. The `/feedback` command sends the full conversation transcript to Anthropic (5-year retention) and optionally creates a public GitHub issue.

Local session storage is distinct from server-side retention: [[Claude Code]] stores session transcripts locally in plaintext under `~/.claude/projects/` for 30 days by default (configurable via `cleanupPeriodDays`). This is what enables session resume and forking. For cloud execution (web sessions), code runs in isolated Anthropic-managed VMs; the repository is cloned to the VM, and session data follows the same account-type policies as local usage. GitHub credentials in cloud execution are proxied — they never enter the sandbox directly.

Telemetry uses two services: Statsig for operational metrics (latency, reliability, usage patterns — no code or file paths) and Sentry for error logging. Both are default-on for the Claude API and default-off for Bedrock, Vertex, and Foundry. Session quality surveys are default-on for all providers. Opt-out environment variables: `DISABLE_TELEMETRY` (Statsig), `DISABLE_ERROR_REPORTING` (Sentry), `DISABLE_FEEDBACK_COMMAND`, `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` (disables all non-essential traffic including surveys).

## Key Topics

- Consumer (Free/Pro/Max) vs. commercial (Team/Enterprise/API) training policy split
- Development Partner Program: explicit opt-in for model training contribution
- Data retention: 5-year (consumer, opt-in training), 30-day (consumer no-training, commercial standard)
- [[Zero Data Retention]]: per-org Enterprise feature, not default
- `/feedback` command: sends full transcript, 5-year retention
- Session quality surveys: numeric rating only, no conversation data
- Local storage: `~/.claude/projects/` plaintext JSONL, 30-day default (`cleanupPeriodDays`)
- Cloud execution: isolated VMs, GitHub credential proxy, follows same account-type policies
- Statsig telemetry: operational metrics, no code/paths, TLS + AES-256 at rest
- Sentry error logging: default-on for Claude API, default-off for third-party providers
- Opt-out env vars: `DISABLE_TELEMETRY`, `DISABLE_ERROR_REPORTING`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
