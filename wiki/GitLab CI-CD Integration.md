---
title: "GitLab CI-CD Integration"
type: entity
tags: [tool, ci-cd]
sources: ["raw/claude-code-gitlab-ci-cd.md", "raw/platforms-and-integrations.md"]
---

# GitLab CI-CD Integration

The GitLab CI/CD Integration is a beta integration that enables `@claude` mentions in GitLab issues and merge request comments to trigger [[Claude Code]] sessions. Unlike the [[GitHub Actions Integration]], which is maintained by [[Anthropic]], the GitLab integration is maintained by GitLab. Each trigger spawns an isolated CI job in a sandboxed container; Claude implements the requested changes and opens a new merge request with the result, keeping the original branch clean.

Authentication supports three provider modes: the direct Anthropic API (via `ANTHROPIC_API_KEY`), [[Amazon Bedrock]] with OIDC token exchange (no stored AWS credentials), and [[Google Vertex AI]] with Workload Identity Federation. The integration ships with a built-in GitLab [[MCP]] (MCP) server that gives Claude structured access to GitLab APIs — issues, MR metadata, pipelines — without requiring raw API calls. This MCP server is specific to the GitLab integration and is not the same as a self-hosted GitLab MCP server configuration.

Because the integration is beta and maintained by GitLab rather than Anthropic, feature parity with the [[GitHub Actions Integration]] may lag, and support questions should be directed to GitLab. Each CI job runs in a fresh container with no persistent state, so any context beyond the current issue or MR must be passed explicitly. See [[Source - Claude Code GitLab CI-CD]] for pipeline YAML configuration and trigger syntax.
