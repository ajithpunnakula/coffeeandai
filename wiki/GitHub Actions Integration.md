---
title: "GitHub Actions Integration"
type: entity
tags: [tool, ci-cd]
sources: ["raw/claude-code-github-actions.md", "raw/platforms-and-integrations.md", "raw/claude-code-overview.md"]
---

# GitHub Actions Integration

The GitHub Actions Integration is the official mechanism for running [[Claude Code]] in GitHub CI/CD pipelines. It is published as the `anthropics/claude-code-action@v1` GitHub Action and allows developers to mention `@claude` in pull request comments or issues to trigger a Claude Code session on a GitHub-hosted runner. Quick setup is available through the `/install-github-app` slash command, which creates the necessary GitHub App and workflow YAML with guided prompts.

When triggered, the action automatically detects whether it is running in an interactive review context (e.g., a PR comment requesting changes) or a pure automation context (e.g., a scheduled workflow), and selects the appropriate [[Claude Code]] mode accordingly. Claude can read the repository, implement requested changes, commit them back to the branch, and post a summary comment. The entire session runs ephemerally on the GitHub runner and has access to any tools or [[MCP]] servers configured in the workflow.

For enterprise deployments, the action supports routing through [[Amazon Bedrock]] using OIDC token authentication (no long-lived AWS credentials stored in GitHub Secrets) and through [[Google Vertex AI]] using Workload Identity Federation. This allows teams to keep all Claude traffic within their own cloud accounts while still benefiting from CI-integrated code assistance. See [[Source - Claude Code GitHub Actions]] for the full workflow YAML reference.
