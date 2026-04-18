---
title: "Source - Claude Code Tools Reference"
type: source
date: 2026-04-13
source_file: "raw/tools-reference.md"
tags: [claude-code, features]
---

# Source - Claude Code Tools Reference

[[Claude Code]] exposes a set of built-in tools, each with defined permission requirements that govern when user approval is needed. File operation tools — Read, Write, Edit, Glob, and Grep — handle filesystem access at varying privilege levels, with Write and Edit requiring elevated permissions by default. Shell tools include Bash (Unix) and PowerShell (Windows), which execute arbitrary commands and carry the highest permission requirements.

Code intelligence is provided by an LSP tool that integrates with the Language Server Protocol to expose go-to-definition and find-references capabilities directly within the agent's reasoning. Agent spawning tools — Agent, SendMessage, and TeamCreate — enable [[Subagents]] and multi-agent orchestration, allowing [[Claude Code]] to delegate subtasks or coordinate parallel [[Subagents]] across a codebase. Scheduling tools (CronCreate, CronDelete, CronList) support recurring automated task execution.

Web tools (WebFetch, WebSearch) allow the agent to retrieve external content and perform searches. The Monitor tool provides streaming output from background commands, enabling long-running processes to report status back into the conversation context without blocking. Together these tools form a comprehensive capability surface that can be selectively restricted via CLI flags or [[Permission Modes]] settings.

## Key Topics

- File tools: Read, Write, Edit, Glob, Grep (with permission tiers)
- Shell tools: Bash, PowerShell
- LSP tool: go-to-definition, find-references via Language Server Protocol
- Agent spawning: Agent, SendMessage, TeamCreate for [[Subagents]] and orchestration
- Scheduling: CronCreate, CronDelete, CronList
- Web tools: WebFetch, WebSearch
- Monitor tool for background command streaming
- Permission requirements per tool
- Tool restriction via CLI flags and [[Permission Modes]]
