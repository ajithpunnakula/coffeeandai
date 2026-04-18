---
title: "Auto-compaction"
type: concept
tags: [features, claude-code]
sources: ["raw/how-claude-code-works.md", "raw/explore-the-context-window.md", "raw/manage-costs-effectively.md"]
---

# Auto-compaction

Auto-compaction is [[Claude Code]]'s automatic mechanism for managing [[Context Window]] limits during long sessions. When the context approaches its capacity, Claude first clears older tool outputs (which tend to be verbose and redundant), then summarizes the conversation history into a condensed representation. This allows the [[Agentic Loop]] to continue without interruption rather than halting when context fills up.

The compaction threshold is controlled by the `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` environment variable, which sets the percentage of context fill at which compaction triggers. A related variable, `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, controls the window size used during compaction. Manual compaction is available at any time via the `/compact` slash command, which optionally accepts focus instructions — for example, `/compact focus on the authentication refactor` — to guide what the summary prioritizes.

[[Skills]] content is treated specially during compaction: up to 5,000 tokens per skill and 25,000 tokens combined are preserved through the summarization process, ensuring that loaded skills remain available after compaction. [[Hooks]] provide another mechanism for re-injecting critical context: a `SessionStart` handler with a `compact` matcher fires immediately after compaction completes, allowing hook scripts to push project-critical information back into the context.

Auto-compaction interacts with cost management. Compaction itself consumes tokens (to generate the summary), but prevents the session from needing to restart entirely, which would require re-reading all project context from scratch. See [[Checkpointing]] for a complementary mechanism that snapshots full conversation state for resumption or rollback rather than summarization.
