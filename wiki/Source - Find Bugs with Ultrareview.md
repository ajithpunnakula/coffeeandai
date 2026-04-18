---
title: "Source - Find Bugs with Ultrareview"
type: source
date: 2026-04-17
source_file: "raw/find-bugs-with-ultrareview.md"
tags: [ultrareview, code-review, multi-agent, cloud, claude-code]
---

This source from the [[Claude Code]] official documentation describes ultrareview, a research preview feature (available in v2.1.86+) that runs deep, multi-agent code review in the cloud. When invoked with `/ultrareview`, [[Claude Code]] launches a fleet of reviewer agents in a remote sandbox to find and independently verify bugs in a branch or pull request.

Compared to the local `/review` command, ultrareview offers three key advantages: higher signal (every finding is independently reproduced and verified, focusing on real bugs rather than style suggestions), broader coverage (many reviewer agents explore changes in parallel, surfacing issues a single-pass review might miss), and no local resource use (the review runs entirely in a remote sandbox).

The command supports two modes: without arguments it reviews the diff between the current branch and the default branch (including uncommitted and staged changes), and with a PR number (`/ultrareview 1234`) it clones the pull request directly from GitHub. Before launching, [[Claude Code]] shows a confirmation dialog with review scope, remaining free runs, and estimated cost. Reviews typically take 5-10 minutes and run as background tasks tracked via `/tasks`.

Ultrareview is a premium feature billing against extra usage rather than plan included usage. Pro and Max subscribers receive three free one-time runs per account. After free runs, each review costs approximately $5-$20 depending on change size. Extra usage must be enabled before launching a paid review. The feature requires authentication with a Claude.ai account and is not available on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]], nor for organizations with [[Zero Data Retention]] enabled.

The document contrasts `/review` (local, single-pass, seconds to minutes, counts toward normal usage, best for quick iteration feedback) with `/ultrareview` (remote, multi-agent with verification, 5-10 minutes, premium pricing, best for pre-merge confidence on substantial changes).

## Key Topics
- `/ultrareview` command for deep multi-agent code review
- Fleet of reviewer agents with independent bug verification
- Remote cloud sandbox execution with no local resource use
- Branch diff mode vs PR mode (`/ultrareview <PR#>`)
- Background task execution tracked via `/tasks`
- Premium pricing: 3 free runs, then $5-$20 per review as extra usage
- Comparison with local `/review` command
- Requires Claude.ai authentication (not available on third-party providers)
- [[Zero Data Retention]] organizations excluded
- Research preview status (v2.1.86+)
