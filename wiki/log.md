---
title: "Wiki Log"
type: log
---

# Wiki Log

## [2026-04-11] ingest | LLM Wiki Pattern
Ingested Karpathy's LLM Wiki gist. Created source summary, plus pages for RAG, LLM, Obsidian, Vannevar Bush, and Claude Code. Updated index.

## [2026-04-11] ingest | Demystifying Evals for AI Agents
Ingested Anthropic's evals guide. Created source summary, plus pages for AI Agent Evaluation, Grader Types, SWE-bench Verified. Updated existing LLM and Claude Code pages with new source references. Updated index.

## [2026-04-12] lint | Fixed 16 issues
No contradictions, orphans, stale claims, or frontmatter issues found. Fixed 16 issues:
- Created 13 missing stub pages for broken wikilinks: Agent SDK, pass@k, pass^k, Terminal-Bench, tau-Bench, tau2-Bench, BrowseComp, WebArena, OSWorld, Obsidian Web Clipper, Marp, Dataview, qmd.
- Added 3 missing cross-references: Claude Code → AI Agent Evaluation + Grader Types; LLM → AI Agent Evaluation + Grader Types; Source - LLM Wiki Pattern → Claude Code.
- Updated index.md with all 13 new pages.

## [2026-04-13] ingest | 78 Claude Code documentation sources
Bulk ingest of 78 Claude Code documentation pages from docs.anthropic.com covering the full product surface:

**78 source summary pages created:**
- Getting started (5): Overview, Quickstart, Terminal Guide, Desktop Quickstart, Web Quickstart
- Features (15): How It Works, Common Workflows, What's New, Interactive Mode, Commands, CLI Reference, Tools Reference, Voice Dictation, Fullscreen Rendering, Output Styles, Fast Mode, Checkpointing, Context Window Explorer, Keyboard Shortcuts, Status Line
- Configuration (11): Settings Reference, Advanced Setup, Model Configuration, Environment Variables, Permission Configuration, Permission Modes, Server-Managed Settings, LLM Gateway, Terminal Setup, Directory Reference, Memory Systems
- Security (3): Security, Sandboxing, Development Containers
- Privacy (2): Data Usage, Zero Data Retention
- Extensions (11): Extension Layer Overview, Skills System, Plugin Creation, Plugins Reference, Plugin Marketplace Creation, Plugin Discovery, MCP Integration, Custom Subagents, Hooks Reference, Hooks Quickstart, Channels Reference
- Automation (7): Scheduled Tasks (Loop), Desktop Scheduled Tasks, Cloud Scheduled Tasks, Agent Teams, Programmatic Mode, Ultraplan, Computer Use
- Cloud providers (3): Amazon Bedrock, Google Vertex AI, Microsoft Foundry
- IDE integration (4): VS Code Extension, JetBrains Plugin, Desktop App, Chrome Integration
- CI/CD (4): GitHub Actions, GitLab CI/CD, Code Review, Slack Integration
- Enterprise (5): Enterprise Deployment, Enterprise Network Config, Authentication, Monitoring, Team Analytics
- Other (3): Best Practices, Troubleshooting, Platforms and Integrations, Cost Management, Remote Control, Channels Guide, GitHub Enterprise Server

**14 entity pages created:** Anthropic, VS Code Extension, JetBrains Plugin, Amazon Bedrock, Google Vertex AI, Microsoft Foundry, Claude Desktop App, Claude in Chrome, GitHub Actions Integration, GitLab CI-CD Integration, Slack Integration, OpenTelemetry, LiteLLM, GitHub Enterprise Server.

**24 concept pages created:** CLAUDE.md File, Permission Modes, Sandboxing, Hooks, Skills, Plugins, Subagents (expanded from stub), Agent Teams, Channels, Remote Control, Computer Use, Context Window, Agentic Loop, Auto-compaction, Fast Mode, Extended Thinking, Prompt Caching, Zero Data Retention, Git Worktrees, Scheduled Tasks, Ultraplan, MCP, Output Styles, Auto Memory.

**3 existing pages updated:** Claude Code (expanded to comprehensive 7-source coverage), Agent SDK (expanded from stub), Checkpointing (created as full concept page).

Updated index.md with all new pages.

## [2026-04-13] lint | Fixed 67 issues
Fixed broken wikilinks across 59 files, created 2 missing pages, removed 1 template artifact:
- Corrected ~50 wrong-name wikilinks across 56 files (e.g., CLAUDE.md→CLAUDE.md File, Model Context Protocol→MCP, VS Code→VS Code Extension, plus ~15 misnamed source references).
- Created 2 missing concept pages: Prompt Injection, .claude Directory.
- Removed Page Name template artifact from Obsidian page.
- Added alias-syntax links for ~12 shorthand references (e.g., Server-Managed Settings→Source - ...|Server-Managed Settings).
- Updated index.md with 2 new pages.

## [2026-04-13] query | When to use scheduled tasks
Created analysis page covering when to use each scheduling tier (session `/loop`, Desktop local, Cloud) and when not to use a scheduler at all. Added to index under Analyses.

## [2026-04-13] ingest | Building Effective Agents
Ingested Anthropic's engineering blog post on agentic system patterns. Created source summary plus Agentic Patterns concept page covering five workflow patterns (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) and autonomous agents. Updated Anthropic, LLM, Agentic Loop, Agent SDK, and SWE-bench Verified pages.

## [2026-04-13] ingest | DeepSeek-R1
Ingested DeepSeek's paper on incentivizing LLM reasoning via reinforcement learning. Created source summary plus 3 entity pages (DeepSeek, DeepSeek-R1, DeepSeek-V3) and 2 concept pages (GRPO, Reinforcement Learning for Reasoning). Updated LLM and SWE-bench Verified pages.

## [2026-04-13] ingest | Front Office Management, EMR IP, Pharmacy Billing
Ingested three AIDA platform sources: hotel front office tutorial, hospital EMR inpatient specification, and pharmacy billing tutorial. Created 3 source summaries plus AIDA HMS entity page and Electronic Medical Records concept page. Skipped duplicate Karpathy gist (karpathy-karpathy-...md is same source as already-ingested llm-wiki.md).

## [2026-04-17] lint | Fixed 13 issues
Fixed 12 broken wikilinks pointing to non-existent pages (converted external tool/service references to plain text) and added 1 missing cross-reference (Scheduled Tasks → When to Use Scheduled Tasks) to resolve orphan.

## [2026-04-17] update | Removed all non-Claude-Code content
Removed all wiki pages and raw sources not related to Claude Code documentation. Deleted 7 non-CC source summaries (LLM Wiki Pattern, Demystifying Evals, Building Effective Agents, DeepSeek-R1, Front Office Management, EMR IP, Pharmacy Billing), 27 entity/concept pages sourced exclusively from non-CC material (AIDA HMS, DeepSeek, Agentic Patterns, benchmarks, etc.), and 8 raw source files. Edited 4 mixed-source pages (Agent SDK, Agentic Loop, Anthropic, Claude Code) to remove non-CC source references and body text. Rebuilt index. Wiki now contains only Claude Code documentation content.

## [2026-04-17] ingest | 54 new sources (Agent SDK, certification, API docs, changelogs)
Bulk ingest of 54 sources across four categories:

**29 Agent SDK source summaries created:** Overview, Python Reference, TypeScript Reference, Quickstart, Hosting, Agent Loop, Migration, System Prompts, Permissions, Streaming, TypeScript V2 Preview, CC Features in SDK, Structured Output, Skills in SDK, Plugins in SDK, Slash Commands in SDK, Subagents in SDK, MCP Connection, Custom Tools, Approvals/Input, Hooks in SDK, Tool Search, Plugin Versions, OpenTelemetry, Security Deployment, Cost Tracking, Streaming Input, Todo Lists, Sessions, Checkpointing.

**5 certification source summaries created:** Exam Guide, 5 Domains, 6 Scenarios, 12-Week Study Plan, Practice Questions.

**7 Claude API/prompt engineering source summaries created:** Prompt Caching, Prompt Engineering Overview, Prompt Engineering & Structured Output, Message Batches, Tool Use, Tool Design & MCP Integration, Building with Extended Thinking.

**13 Claude Code source summaries created:** Anti-Patterns Cheatsheet, Routines, Changelog, Configuration & Workflows, Context Management & Reliability, Error Reference, Ultrareview, Legal & Compliance, Rewind/Checkpointing (SDK), Streaming Input, Todo Lists, Work with Sessions, Agentic Architecture & Orchestration, plus 3 weekly changelogs (Weeks 13-15).

**5 new entity/concept pages created:** Claude Certified Architect Exam (entity), Tool Search (concept), Structured Output (concept), Routines (concept), Ultrareview (concept).

**14 existing pages updated with new sources:** Agent SDK (expanded to 32 sources with full rewrite), Hooks, MCP, Subagents, Skills, Plugins, Permission Modes, OpenTelemetry, Extended Thinking, Prompt Caching, Agentic Loop, Checkpointing, Context Window, Sandboxing.

Updated index.md with all new pages organized into subsections.

## [2026-04-17] lint | Fixed 15 issues
- Fixed 7 broken wikilinks: Claude Certified Architect Foundations Exam → Claude Certified Architect Exam across 7 source pages.
- Created 1 missing concept page: Message Batches (referenced by 7 source pages).
- Fixed 3 orphan concept pages (Output Styles, Routines, Ultrareview) by adding inbound links from Claude Code entity page.
- Fixed 4 broken alias-syntax wikilinks in source pages (Server-Managed Settings, Claude Code on the Web, Environment Variables).
- Removed stale broken-link references from log.md backtick spans.
- Updated index.md with Message Batches entry.

## [2026-04-17] generate-course | Claude Certified Architect Foundations Exam Prep
Generated 31 cards across 5 domains. Card mix: 16 page, 6 quiz, 6 scenario, 3 reflection. All 6 exam scenarios covered as multi-step branching cards. Difficulty curve: 1.6 → 2.2 → 2.7. Validator passes with 1333 checks, 0 failures.
