---
title: "Source - Automate Work with Routines"
type: source
date: 2026-04-17
source_file: "raw/automate-work-with-routines.md"
tags: [routines, automation, scheduled-tasks, github-triggers, api-triggers, cloud]
---

This source from the [[Claude Code]] official documentation introduces routines, a research preview feature that puts [[Claude Code]] on autopilot by defining configurations that run on [[Anthropic]]-managed cloud infrastructure. A routine packages a prompt, one or more repositories, and a set of [[MCP]] connectors, then executes automatically based on configured triggers.

Routines support three trigger types: scheduled (recurring cadence like hourly, daily, or weekly), API (on-demand HTTP POST to a per-routine endpoint with a bearer token), and GitHub (automatic response to repository events such as pull requests or releases). A single routine can combine multiple trigger types. The document illustrates use cases including backlog maintenance, alert triage, bespoke code review, deploy verification, documentation drift detection, and library porting across SDKs.

Routines can be created from the web at claude.ai/code/routines, from the CLI using the `/schedule` command, or from the Desktop app via "New remote task." They run autonomously as full [[Claude Code]] cloud sessions with no permission-mode picker or approval prompts. The session can run shell commands, use [[Skills]] committed to the cloned repository, and call any included connectors. Routines belong to individual claude.ai accounts and are not shared with teammates; actions taken through connected identities (GitHub commits, Slack messages) appear as the routine owner.

The API trigger provides a dedicated HTTP endpoint where POSTing with a bearer token starts a new session. The request body accepts an optional `text` field for run-specific context. The `/fire` endpoint is under the `experimental-cc-routine-2026-04-01` beta header. GitHub triggers support pull request and release events with configurable filters including author, title, body, base branch, head branch, labels, draft status, and merge status.

Routines draw down subscription usage the same way interactive sessions do, with an additional daily cap on runs per account. Organizations with extra usage enabled can continue running routines on metered overage. The feature is available on Pro, Max, Team, and Enterprise plans with Claude Code on the web enabled.

## Key Topics
- Routines as saved [[Claude Code]] configurations running on [[Anthropic]] cloud infrastructure
- Three trigger types: scheduled, API, and GitHub event
- Autonomous execution with no permission prompts during runs
- `/schedule` CLI command for creating and managing routines
- API trigger with bearer token authentication and `/fire` endpoint
- GitHub triggers for pull request and release events with filters
- [[MCP]] connectors for external service integration (Slack, Linear, Google Drive)
- Repository cloning with `claude/`-prefixed branch restrictions
- Cloud environments controlling network access, environment variables, and setup scripts
- Daily run caps and subscription usage metering
- Research preview status with potential changes to behavior and limits
