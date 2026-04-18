---
title: "Source - Claude Code GitLab CI-CD"
type: source
date: 2026-04-13
source_file: "raw/claude-code-gitlab-ci-cd.md"
tags: [claude-code, ci-cd]
---

# Source - Claude Code GitLab CI-CD

[[Claude Code]] integrates with [[GitLab CI-CD Integration]] in a beta integration maintained by GitLab (not [[Anthropic]]). The integration allows `@claude` mentions in GitLab issues and merge request comments to trigger CI/CD jobs that run [[Claude Code]] in isolated containers. Claude analyzes the issue or MR context, makes code changes in a branch, and opens a merge request for review through the normal GitLab review process. Support issues are tracked in a dedicated GitLab issue rather than Anthropic channels.

The integration supports three provider backends: Claude API (SaaS via `ANTHROPIC_API_KEY`), [[Amazon Bedrock]] (OIDC-based IAM role assumption, no static credentials), and [[Google Vertex AI]] (Workload Identity Federation). Each run executes in an isolated container with workspace-scoped permissions constraining writes, and all changes flow through MRs subject to branch protection and approval rules. A built-in GitLab MCP server is available at `/bin/gitlab-mcp-server` within the container, enabling the `mcp__gitlab` tool for GitLab API operations (posting comments, creating MRs). Setup requires adding `ANTHROPIC_API_KEY` as a masked CI/CD variable and adding a `claude` job to `.gitlab-ci.yml`. The job can be triggered manually, via MR events, or via web/API triggers when a comment contains `@claude`.

Context for Claude sessions is passed through `AI_FLOW_*` variables: `AI_FLOW_INPUT` contains the triggering comment or instruction, `AI_FLOW_CONTEXT` provides the issue/MR context, and `AI_FLOW_EVENT` identifies the trigger type. The Bedrock integration uses GitLab OIDC to exchange a GitLab job JWT for temporary AWS credentials at runtime (no stored keys). The Vertex AI integration uses Workload Identity Federation via credential file injection. Model IDs for Bedrock include region-specific prefixes (e.g., `us.anthropic.claude-sonnet-4-6`). CI costs include both GitLab runner compute minutes and Claude API token usage.

## Key Topics

- Beta integration maintained by GitLab; support via GitLab issue tracker
- Trigger: `@claude` mentions in GitLab issues, MR comments, review threads
- Sandboxed execution in containers with workspace-scoped write permissions
- All changes flow through MRs, subject to branch protection and approvals
- Built-in GitLab MCP server at `/bin/gitlab-mcp-server` (`mcp__gitlab` tool)
- Three provider backends: Claude API, [[Amazon Bedrock]] (OIDC), [[Google Vertex AI]] (WIF)
- `AI_FLOW_INPUT`, `AI_FLOW_CONTEXT`, `AI_FLOW_EVENT` variables for session context
- Quick setup: masked `ANTHROPIC_API_KEY` variable + `claude` job in `.gitlab-ci.yml`
- Bedrock: GitLab OIDC → `aws sts assume-role-with-web-identity` (no static keys)
- Vertex: Workload Identity Federation credential file injection (no downloaded keys)
- Bedrock model IDs require region prefix (e.g., `us.anthropic.claude-sonnet-4-6`)
- `--permission-mode acceptEdits` and `--allowedTools` flags control Claude's capabilities
- CI costs: GitLab runner minutes + Claude API tokens; optimize with `max_turns` and timeouts
- CLAUDE.md at repo root guides Claude's coding standards during runs
