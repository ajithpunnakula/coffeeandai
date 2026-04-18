---
title: "Source - Claude Code Team Analytics"
type: source
date: 2026-04-13
source_file: "raw/track-team-usage-with-analytics.md"
tags: [claude-code, enterprise]
---

# Source - Claude Code Team Analytics

[[Claude Code]] provides built-in analytics dashboards for Teams and Enterprise plans at `claude.ai/analytics/claude-code`, and for API (Console) customers at `platform.claude.com/claude-code`. The Teams/Enterprise dashboard is the richer offering, including usage metrics, contribution metrics tied to GitHub PR activity, a leaderboard, and CSV data export. The Console dashboard covers usage and spend tracking per user without GitHub integration.

Contribution metrics require connecting a GitHub organization via the Claude GitHub App and are in public beta. They are unavailable for organizations with [[Zero Data Retention]] enabled. When enabled, [[Claude Code]] analyzes every merged pull request to determine which code was written with Claude Code assistance. The attribution process extracts added lines from the PR diff, identifies Claude Code sessions that edited matching files within a 21-day window (21 days before to 2 days after merge), and matches PR lines against Claude Code session output using normalized comparison (whitespace trimming, quote standardization, lowercase). Matched PRs receive a `claude-code-assisted` label in GitHub. Lines are excluded if they are auto-generated (lock files, build artifacts, minified code), over 1,000 characters, or if the developer substantially rewrote the code (more than 20% difference). The algorithm is deliberately conservative and represents an underestimate of actual impact.

Summary metrics displayed at the top of the Teams/Enterprise dashboard are: PRs with Claude Code (count and percentage of total merged PRs), lines of code with Claude Code (effective lines in assisted PRs, counting lines with more than 3 characters excluding trivial punctuation), suggestion accept rate (Edit/Write/NotebookEdit acceptances), and lines of code accepted (accepted suggestions, not tracking subsequent deletions). Charts show adoption trends (daily active users and sessions), PRs per user over time, and a PR breakdown by Claude Code-assisted vs. unassisted. The leaderboard shows the top 10 contributors with a full CSV export available. Contribution metrics support both GitHub Cloud and [[GitHub Enterprise Server]].

## Key Topics

- Teams/Enterprise dashboard: `claude.ai/analytics/claude-code` (Admins and Owners)
- Console API dashboard: `platform.claude.com/claude-code` (UsageView permission)
- Contribution metrics: public beta, requires GitHub App installation and Owner role
- [[Zero Data Retention]] disables contribution metrics (usage metrics still available)
- PR attribution: 21-day session window (before/after merge), conservative matching
- Line normalization: whitespace trimming, quote standardization, lowercase conversion
- Auto-excluded files: lock files, build artifacts, minified code, lines over 1,000 chars
- 20% rewrite threshold: substantially developer-rewritten code not attributed
- `claude-code-assisted` GitHub label applied to matching merged PRs
- Summary metrics: PRs with CC, lines with CC, CC percentage, accept rate, lines accepted
- Charts: adoption (DAU/sessions), PRs per user, PR breakdown by assistance
- Leaderboard: top 10 contributors, full CSV export available
- GitHub Cloud and GHES both supported for contribution metrics
- Programmatic access: search GitHub for PRs labeled `claude-code-assisted`
