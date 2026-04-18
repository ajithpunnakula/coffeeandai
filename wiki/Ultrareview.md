---
title: "Ultrareview"
type: concept
tags: [features, claude-code]
sources: ["raw/find-bugs-with-ultrareview.md", "raw/changelog.md"]
---

# Ultrareview

Ultrareview is a multi-agent cloud code review feature in [[Claude Code]] that finds bugs by having multiple independent agents analyze the same codebase in parallel, then cross-verifying their findings to reduce false positives.

Invoked via the `/ultrareview` slash command, the feature delegates review work to [[Anthropic]]'s cloud infrastructure (similar to [[Ultraplan]]). Multiple agent instances independently scan the code for issues — each agent operates in its own [[Context Window]] and may focus on different aspects (logic errors, security vulnerabilities, performance issues, API misuse). After the independent passes complete, a verification stage cross-checks findings: bugs flagged by multiple agents are promoted to high confidence, while single-agent findings receive additional scrutiny.

The results are presented in the browser at claude.ai/code, where the user can review each finding with inline code context, accept or dismiss issues, and optionally teleport fixes back to the local [[Claude Code]] CLI for implementation.

Ultrareview complements manual code review and the [[GitHub Actions Integration]] automated review — it is designed for deep, time-intensive analysis rather than fast PR-level feedback.

## See also

- [[Ultraplan]], [[Claude Code]], [[Agent Teams]]
- [[Source - Find Bugs with Ultrareview]]
