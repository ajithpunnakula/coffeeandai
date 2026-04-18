---
id: card_e3d8f2a1
type: page
order: 15
difficulty: 2
title: "CLAUDE.md Hierarchy and Configuration"
domain: "Claude Code Configuration & Workflows"
wiki_refs: ["CLAUDE.md File", ".claude Directory"]
source: "raw/claude-code-configuration-workflows.md"
content_hashes:
  "CLAUDE.md File": "cdee20a4"
  ".claude Directory": "7ee5d41b"
speaker_notes: |
  Walk through the three-layer CLAUDE.md hierarchy from broadest to most specific. Emphasize that more specific configs override general ones, just like CSS specificity. The key takeaway is that personal preferences belong in your user-level config, team standards go in the project-level file, and module-specific rules use directory-level files. Highlight the anti-pattern of committing personal preferences into the project-level config, which forces your style on the entire team.
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_e3d8f2a1-OVwo4EVLV7n10J1kjVrYI91LvA1Qxr.mp3"
---

# CLAUDE.md Hierarchy and Configuration

Claude Code reads instructions from **CLAUDE.md files** at three levels, each serving a distinct purpose. Understanding this hierarchy is essential for keeping configurations clean, shareable, and conflict-free.

## The Three Layers

### 1. User-level: `~/.claude/CLAUDE.md`

Your **personal** preferences that apply to every project you work on. This file is never committed to version control.

**Examples:** preferred language, code style quirks, personal workflow notes.

### 2. Project-level: `.claude/CLAUDE.md` (repo root)

**Team standards** that apply to everyone working on this project. This file is version-controlled and shared across the team.

**Examples:** coding conventions, testing requirements, architecture decisions, forbidden patterns.

### 3. Directory-level: `CLAUDE.md` in any subdirectory

**Module-specific rules** that apply only when Claude is working within that directory tree.

**Examples:** a `services/auth/CLAUDE.md` that specifies security review requirements, or a `frontend/CLAUDE.md` with component naming conventions.

## Precedence Rules

More specific overrides more general: **directory-level > project-level > user-level**. When the same instruction appears at multiple levels, the most specific version wins. This mirrors the principle of locality -- rules closest to the code take priority.

## Modular Configuration

For large projects, you can split configuration into focused files using the `.claude/rules/` directory. Each file in this directory is automatically loaded alongside the main CLAUDE.md. This keeps the main config readable while allowing domain-specific rules to live in their own files.

The `@import` directive lets you pull in additional instruction files, enabling reusable configuration fragments across projects.

## Anti-Pattern: Personal Preferences in Project Config

Putting personal preferences (editor quirks, verbosity settings, formatting opinions) into the project-level `.claude/CLAUDE.md` forces your individual style onto every team member. This creates friction and merge conflicts. Keep personal preferences in `~/.claude/CLAUDE.md` where they belong.

**Exam tip:** When a question asks where team coding standards should live, the answer is always the project-level `.claude/CLAUDE.md` -- it is version-controlled and shared with the team.
