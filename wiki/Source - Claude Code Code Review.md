---
title: "Source - Claude Code Code Review"
type: source
date: 2026-04-13
source_file: "raw/code-review.md"
tags: [claude-code, ci-cd]
---

# Source - Claude Code Code Review

[[Claude Code]]'s managed Code Review service integrates with GitHub pull requests to provide automated, multi-agent review feedback. Currently in research preview and available to Team and Enterprise plan subscribers, it dispatches multiple parallel agents to analyze a PR simultaneously, each focusing on different aspects of the change. Comments are posted directly to the PR with severity tags: **Important** (blocking concerns), **Nit** (style or minor issues), and **Pre-existing** (issues found in the PR's context but not introduced by it).

The service costs approximately $15–25 per review and takes around 20 minutes to complete. Trigger modes are flexible: reviews can fire automatically when a PR is opened, re-trigger on new pushes, or be invoked manually by commenting `@claude review` on a PR. This flexibility allows teams to balance cost and latency — auto-triggering on every push for critical repositories, or reserving manual invocation for draft PRs.

Review behavior can be customized by adding a `REVIEW.md` file to the repository, which provides review-specific rules and context that agents incorporate into their analysis. This is separate from the general `CLAUDE.md` project instructions and allows teams to encode review standards, naming conventions, or domain-specific rules without polluting the main development instructions.

## Key Topics

- Managed Code Review service for GitHub PRs (research preview)
- Available on Team and Enterprise plans
- Multiple parallel agents analyzing PRs simultaneously
- Severity tags: Important, Nit, Pre-existing
- Cost: ~$15–25 per review, ~20 minutes duration
- Trigger modes: auto on PR open, on push, or manual `@claude review`
- `REVIEW.md` for repository-specific review rules
- Distinction from general [[Claude Code]] project instructions (`CLAUDE.md`)
