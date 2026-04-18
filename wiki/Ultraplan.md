---
title: "Ultraplan"
type: concept
tags: [features, claude-code]
sources: ["raw/plan-in-the-cloud-with-ultraplan.md", "raw/commands.md"]
---

# Ultraplan

Ultraplan is a [[Claude Code]] feature that delegates plan generation from the local CLI to a cloud session running in plan mode. Instead of Claude producing a plan inline in the terminal (which blocks the terminal while thinking), Ultraplan offloads the planning work to [[Anthropic]]'s cloud infrastructure, freeing the local terminal for other use while the plan is being drafted.

The feature is invoked via the `/ultraplan` slash command. Once triggered, Claude opens a planning session on claude.ai/code in the browser. The user can observe the plan as it develops, leave inline comments at specific plan steps, and react with emoji to indicate approval or concerns. This collaborative review process happens in the browser UI rather than the terminal, which suits async workflows or situations where plans need stakeholder review.

After the plan is complete, the user has two execution paths: run the plan directly on the web (using cloud infrastructure) or "teleport" it back to the local terminal for implementation by the local [[Claude Code]] CLI. The teleport option is useful when local filesystem access, custom tool configuration, or [[Hooks]] are needed for execution.

One important constraint: Ultraplan cannot be used simultaneously with [[Remote Control]], because both features occupy the claude.ai/code interface. Attempting to use both at the same time will result in a conflict. Ultraplan complements rather than replaces the `/think` extended reasoning mode — `/think` runs inline during the [[Agentic Loop]], while Ultraplan specifically delegates the initial planning phase to a dedicated cloud session before any implementation begins.
