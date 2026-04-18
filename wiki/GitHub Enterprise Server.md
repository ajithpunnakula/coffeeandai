---
title: "GitHub Enterprise Server"
type: entity
tags: [tool, enterprise]
sources: ["raw/claude-code-with-github-enterprise-server.md", "raw/enterprise-deployment-overview.md"]
---

# GitHub Enterprise Server

GitHub Enterprise Server (GHES) is the self-managed deployment of GitHub, installable on-premises or in a private cloud. [[Claude Code]] supports connecting to GHES instances for Teams and Enterprise plan customers, enabling code review, web sessions, teleport (remote terminal), and plugin marketplace access against private GHES repositories. Initial setup requires a GHES administrator to create a GitHub App via a guided manifest flow that configures the necessary OAuth scopes and webhook registrations.

An important limitation: the GitHub [[MCP]] (MCP) server — which gives Claude structured access to GitHub APIs for issues, PRs, and repositories — is not supported on GHES. The workaround is to use the `gh` CLI tool with the `--hostname` flag pointing to the GHES instance; Claude can invoke `gh` commands to interact with GHES APIs through the standard Bash tool rather than a dedicated MCP server. Teams relying heavily on GitHub API access via MCP should account for this gap in their GHES deployment plans.

Contribution metrics (commits, PRs opened, code review activity attributed to Claude Code sessions) are delivered to the GHES instance via webhooks rather than through [[Anthropic]] cloud polling, which keeps metric data within the self-hosted environment. GHES support requires Claude Code to be configured with the enterprise hostname via `GITHUB_ENTERPRISE_HOSTNAME` or equivalent settings. See [[Source - Claude Code GitHub Enterprise Server]] and [[Source - Claude Code Enterprise Deployment]] for administrator setup instructions.
