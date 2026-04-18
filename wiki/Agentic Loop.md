---
title: "Agentic Loop"
type: concept
tags: [architecture, claude-code]
sources: ["raw/how-claude-code-works.md", "raw/best-practices-for-claude-code.md", "raw/how-the-agent-loop-works.md", "raw/agentic-architecture-orchestration.md"]
---

# Agentic Loop

The agentic loop is the core execution cycle that distinguishes [[Claude Code]] from a conventional chatbot. Rather than generating a single response, Claude iterates through a repeating cycle: gather context (read files, search code, check git status), take action (edit files, run shell commands, call tools), and verify results (run tests, check output, inspect changes). This cycle repeats autonomously until the task is complete or Claude determines it needs user input to proceed.

What makes the loop "agentic" is tool use. [[Claude Code]] has access to five categories of tools: file operations (read, write, edit), search (grep, glob, ripgrep), execution (bash commands, test runners), web access (fetch, search), and code intelligence (LSP-backed diagnostics, symbol lookup). Each tool call is a discrete step in the loop, and Claude selects tools based on what it observes at each iteration.

Each iteration of the loop consumes [[Context Window]] space. Tool results — file contents, command output, search results — accumulate in the context. For long-running tasks, [[Auto-compaction]] may trigger to summarize older portions of the conversation and free space for continued iteration. [[Hooks]] can inject additional context at specific points in the loop (e.g., after a tool call, after a bash command completes).

[[Source - Claude Code Best Practices|Best practices for Claude Code]] recommend structuring requests to work with the agentic loop rather than against it: break large tasks into independently verifiable sub-tasks, let Claude run tests after edits rather than interrupting to check, and use /think or [[Extended Thinking]] before complex multi-step plans. The loop model also underpins [[Agent Teams]], where multiple Claude Code instances run their own agentic loops in parallel, coordinated by an orchestrator.
