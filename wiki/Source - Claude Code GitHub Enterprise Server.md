---
title: "Source - Claude Code GitHub Enterprise Server"
type: source
date: 2026-04-13
source_file: "raw/claude-code-with-github-enterprise-server.md"
tags: [claude-code, enterprise]
---

# Source - Claude Code GitHub Enterprise Server

[[Claude Code]] supports self-managed [[GitHub Enterprise Server]] (GHES) instances for Teams and Enterprise plans. Once an admin connects the GHES instance, developers can use it for web sessions, automated code review, teleport sessions, and plugin marketplaces without per-repository configuration. [[Claude Code]] detects the GHES hostname automatically from the git remote in the working directory when developers run `claude --remote`.

Admin setup uses a guided manifest-flow: the admin navigates to `claude.ai/admin-settings/claude-code`, enters a display name and GHES hostname, optionally provides a CA certificate for private certificate authorities, then clicks through to the GHES instance where a pre-filled GitHub App manifest is reviewed and installed in one click. GHES redirects back with app credentials stored automatically. The GitHub App requires Read & Write on Contents, Pull requests, Issues, Checks, Actions (Read), Repository hooks, and Metadata (Read), and subscribes to `pull_request`, `issue_comment`, `pull_request_review_comment`, `pull_request_review`, and `check_run` events. A manual setup path is available if the redirect flow is blocked by network configuration. The GHES instance must be reachable from Anthropic infrastructure; organizations behind firewalls must allowlist Anthropic API IP addresses.

Feature support on GHES is nearly complete: Claude Code on the web (via `claude --remote`), code review (automated PR reviews), teleport sessions (moving sessions between web and terminal), plugin marketplaces (using full git URLs instead of `owner/repo` shorthand), contribution metrics (via webhooks to the analytics dashboard), GitHub Actions (manual workflow setup required; `/install-github-app` is github.com only), and contribution metrics all work. The one unsupported feature is the GitHub MCP server, which does not work with GHES instances. The documented workaround is to use the `gh` CLI configured for the GHES host (`gh auth login --hostname github.example.com`) so Claude can issue `gh` commands during sessions.

For plugin marketplaces, GHES-hosted marketplaces must use full git URLs rather than `owner/repo` shorthand (e.g., `git@github.example.com:platform/claude-plugins.git` or HTTPS equivalent). Managed settings support `hostPattern` source type for allowlisting all marketplaces from a GHES instance without enumerating each repository, and `extraKnownMarketplaces` for pre-registering marketplaces organization-wide.

## Key Topics

- Available on Teams and Enterprise plans only
- Admin connects GHES instance once via manifest flow at `claude.ai/admin-settings/claude-code`
- Guided setup: display name + GHES hostname + optional CA cert → GitHub App manifest → one-click creation
- Manual setup fallback if redirect flow is blocked
- GitHub App permissions: Contents, Pull requests, Issues, Checks, Actions (Read), Repository hooks, Metadata
- Webhook events: pull_request, issue_comment, pull_request_review_comment, pull_request_review, check_run
- GHES instance must be reachable from Anthropic infrastructure; firewall allowlist required
- Automatic GHES detection from git remote when using `claude --remote`
- Supported: web sessions, code review, teleport, plugin marketplaces, contribution metrics, GitHub Actions
- Not supported: GitHub MCP server (workaround: `gh` CLI with `--hostname` flag)
- `/install-github-app` command works only for github.com (not GHES)
- Plugin marketplaces: use full git URLs (not `owner/repo` shorthand)
- Managed settings: `hostPattern` for allowlisting GHES marketplace domains
- `extraKnownMarketplaces` for pre-registering internal marketplaces organization-wide
- Teleport sessions verify GHES repository checkout before fetching branch
