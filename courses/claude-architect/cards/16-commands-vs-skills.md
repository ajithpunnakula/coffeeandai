---
id: card_93c7b5d4
type: page
order: 16
difficulty: 2
title: "Commands vs Skills: When to Use Each"
domain: "Claude Code Configuration & Workflows"
wiki_refs: ["Skills", "Claude Code"]
source: "raw/claude-code-configuration-workflows.md"
content_hashes:
  "Skills": "e9bbf81e"
  "Claude Code": "7ebc57e4"
speaker_notes: |
  Distinguish commands from skills by focusing on their key architectural difference: isolation. Commands run in the current session context, sharing the full conversation history and all tools. Skills can fork the context, creating a separate execution environment that prevents exploration noise from polluting the main session. Walk through the SKILL.md frontmatter fields, especially context fork and allowed-tools. Emphasize that this isolation is what makes skills the right choice for exploratory work or restricted-access tasks.
audio: "https://7vzwt9rqq9ztmrlo.public.blob.vercel-storage.com/courses/claude-architect/audio/card_93c7b5d4-wYWQ9F2sijIJaQ2EXpHmKyNqzEsOFn.mp3"
---

# Commands vs Skills: When to Use Each

Claude Code offers two mechanisms for reusable workflows: **commands** and **skills**. While they may look similar on the surface, they differ fundamentally in execution isolation and tool access control.

## Commands (`.claude/commands/`)

Commands are simple markdown instruction files that run **in the current session context**.

- Share the full conversation history with the main session
- Have access to all tools available in the session
- Ideal for short, repeatable tasks like formatting, generating boilerplate, or running standard checks
- No isolation -- any exploration or file reads become part of the main conversation

## Skills (`.claude/skills/`)

Skills are more powerful. Each skill has a **SKILL.md** file with frontmatter that controls execution behavior:

```yaml
---
name: my-skill
description: What this skill does
context: fork        # Runs in an isolated context
allowed-tools:       # Restricts available tools
  - Read
  - Grep
  - Glob
---
```

### Key Frontmatter Fields

| Field | Purpose |
|---|---|
| `context: fork` | Creates an isolated execution environment, preventing exploration noise from leaking into the main session |
| `allowed-tools` | Restricts which tools the skill can use, enforcing least-privilege access |
| `argument-hint` | Describes what arguments the skill expects when invoked |

## When to Use Each

**Use a command when:**
- The task is simple and well-defined
- You want results visible in the current conversation
- No risk of context pollution from exploration

**Use a skill when:**
- The task involves exploration that would add noise to the main session (e.g., searching across many files to answer a question)
- You need to restrict tool access for safety (e.g., a review skill that should only read, never write)
- The task is complex enough to benefit from a clean execution context

## The Isolation Advantage

The `context: fork` capability is the critical differentiator. When Claude explores multiple files during a skill execution, that exploration stays contained. The main session only receives the skill's final output, keeping your primary conversation focused and clean.

**Exam tip:** If a question describes needing to explore without polluting the main session, the answer is a skill with `context: fork` -- not a command, and not a new terminal session.
