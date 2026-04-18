---
title: "Source - Claude Code Extension Layer Overview"
type: source
date: 2026-04-13
source_file: "raw/extend-claude-code.md"
tags: [claude-code, extensions]
---

# Source - Claude Code Extension Layer Overview

[[Claude Code]]'s extension layer adds customization on top of its core agentic loop. The guide describes seven extension mechanisms: [[CLAUDE.md File]] for persistent context loaded every session, [[Skills]] for reusable knowledge and invocable workflows, [[MCP]] for connecting to external services, [[Subagents]] for isolated context workers, Agent Teams for coordinating multiple independent sessions, [[Hooks]] for deterministic event-driven scripts, and [[Plugins]] as the packaging layer that bundles all the others for distribution.

The guide provides authoritative decision criteria for each mechanism. CLAUDE.md holds "always do X" rules and project conventions. Skills hold reference material and triggerable workflows (e.g., `/deploy`). Subagents handle context isolation and parallel tasks where only the result matters. MCP connects to external data and actions. Hooks automate predictable workflows without LLM involvement. The document includes side-by-side comparison tables for commonly confused pairs: Skill vs Subagent, CLAUDE.md vs Skill, CLAUDE.md vs Rules vs Skills, Subagent vs Agent team, and MCP vs Skill.

Context costs are a key theme. CLAUDE.md loads fully at session start. Skills load descriptions at start, full content on invocation — or zero cost for user-only skills with `disable-model-invocation: true`. MCP tool names load at start with schemas deferred. Subagents run in isolated context that does not consume the main session. Hooks run externally with zero context cost. The guide recommends building setups incrementally rather than configuring everything upfront, with each trigger (repeated mistake, recurring prompt, side task flooding context) mapping to a specific extension to add.

Features can be combined: CLAUDE.md + Skills, Skill + Subagent, Skill + MCP, Hook + MCP. When the same feature name is defined at multiple levels, priority rules govern which wins — with MCP following local > project > user, hooks merging all sources, and skills/subagents using named override hierarchies.

## Key Topics

- Seven extension mechanisms and when to use each
- Side-by-side comparison tables: Skill vs Subagent, CLAUDE.md vs Skill, MCP vs Skill, Subagent vs Agent team
- Incremental build strategy — triggers for adding each extension
- Context loading strategies and cost by feature type
- Feature layering and priority rules across scopes
- Combining extensions for real-world workflows
