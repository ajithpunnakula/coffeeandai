---
title: "Routines"
type: concept
tags: [automation, claude-code]
sources: ["raw/automate-work-with-routines.md", "raw/changelog.md"]
---

# Routines

Routines are automated [[Claude Code]] tasks that run without interactive user input, designed for repeating workflows like daily reports, scheduled maintenance, or event-driven pipelines. They extend [[Scheduled Tasks]] by supporting multiple trigger types beyond time-based cron schedules.

Routines can be triggered three ways: on a **schedule** (cron-based, similar to [[Scheduled Tasks]]), via the **API** (programmatic invocation from external systems), or from **GitHub events** (push, PR, issue activity). Each routine is defined as a prompt that Claude executes with full access to the configured tools, [[MCP]] servers, and [[Skills]].

Routines run in cloud environments on [[Anthropic]] infrastructure, with each execution getting a fresh GitHub clone. Results can be delivered through various channels including commit pushes, PR comments, Slack notifications via [[MCP]], or any other configured output mechanism.

Key differences from [[Scheduled Tasks]]: routines support event-driven triggers (not just time-based), are always cloud-hosted (no local or desktop tier), and are oriented toward production automation rather than ad-hoc developer workflows.

## See also

- [[Scheduled Tasks]], [[Claude Code]], [[Agent SDK]]
- [[Source - Automate Work with Routines]]
