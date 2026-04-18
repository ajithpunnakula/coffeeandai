---
title: "Source - Claude Code GitHub Actions"
type: source
date: 2026-04-13
source_file: "raw/claude-code-github-actions.md"
tags: [claude-code, ci-cd]
---

# Source - Claude Code GitHub Actions

[[Claude Code]] integrates with [[GitHub Actions Integration]] via the `anthropics/claude-code-action@v1` action. When `@claude` is mentioned in a PR comment, issue comment, or pull request review comment, a [[Claude Code]] session runs on GitHub-hosted runners and can analyze code, create PRs, implement features, and fix bugs. The action is built on top of the Claude Agent SDK. Quick setup is available via the `/install-github-app` command in the [[Claude Code]] terminal (requires repository admin access and direct Claude API usage; not available for Bedrock/Vertex users).

The v1.0 GA release introduced breaking changes from the beta. Key changes: `mode` parameter was removed (now auto-detected from configuration), `direct_prompt` renamed to `prompt`, `override_prompt` replaced by `prompt` with GitHub variables, and options like `max_turns`, `model`, `custom_instructions`, and `allowed_tools` are now passed via the unified `claude_args` CLI passthrough parameter. The action auto-detects whether to run in interactive mode (responding to `@claude` mentions) or automation mode (running immediately with a `prompt` parameter) based on configuration.

For enterprise deployments, [[Amazon Bedrock]] and [[Google Vertex AI]] are supported as alternative backends. Bedrock uses GitHub OIDC Identity Provider to assume an IAM role (no static credentials); the workflow uses `aws-actions/configure-aws-credentials@v4` with `role-to-assume`. Vertex AI uses Workload Identity Federation with a GitHub OIDC provider, service account impersonation, and `google-github-actions/auth@v2`. Both approaches eliminate long-lived credentials. For cloud provider usage, a custom GitHub App (rather than the official Anthropic Claude app) is recommended for better control. The `use_bedrock: "true"` or `use_vertex: "true"` action parameters activate the respective backends.

Costs have two components: GitHub Actions runner minutes (consumed on GitHub-hosted runners) and Claude API token costs (per interaction, varying by task complexity). Optimization tips include using specific `@claude` commands, configuring `--max-turns` via `claude_args`, setting workflow-level timeouts, and using GitHub concurrency controls for parallel runs. Security: always use GitHub Secrets for API keys (`${{ secrets.ANTHROPIC_API_KEY }}`), never hardcode them in workflow files.

## Key Topics

- `anthropics/claude-code-action@v1` — the GitHub Action for [[Claude Code]] integration
- Trigger: `@claude` mentions in PR comments, issue comments, review comments
- Quick setup: `/install-github-app` command in [[Claude Code]] terminal
- Manual setup: install Claude GitHub App, add `ANTHROPIC_API_KEY` secret, copy workflow file
- v1.0 breaking changes from beta: removed `mode`, renamed `direct_prompt` to `prompt`, unified `claude_args` passthrough
- `claude_args` accepts any [[Claude Code]] CLI arguments (`--max-turns`, `--model`, `--allowedTools`, etc.)
- Auto-mode detection: interactive (responds to @claude) vs. automation (runs with `prompt` parameter)
- [[Amazon Bedrock]] integration: GitHub OIDC → IAM role assumption (no static keys)
- [[Google Vertex AI]] integration: Workload Identity Federation → service account impersonation
- Custom GitHub App recommended for cloud provider usage
- `use_bedrock: "true"` and `use_vertex: "true"` action parameters
- CLAUDE.md governs Claude's behavior within sessions
- Costs: GitHub runner minutes + Claude API tokens; optimization via `--max-turns` and timeouts
- Code runs on GitHub-hosted runners; code stays on GitHub infrastructure
