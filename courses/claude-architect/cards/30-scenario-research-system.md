---
id: card_d5f9a3c6
type: scenario
order: 30
difficulty: 3
title: "Scenario: Multi-Agent Research System"
domain: "Context Management & Reliability"
wiki_refs: ["Subagents", "Context Window", "Agentic Loop"]
source: "raw/6-exam-scenarios-deep-dive.md"
steps:
  - id: "start"
    situation: "You are designing a multi-agent research system where a coordinator delegates to 3 specialized subagents: market data, technical analysis, and competitor intelligence. Each subagent queries different sources and returns structured findings. How should you structure context passing between the coordinator and the subagents?"
    choices:
      - text: "Pass only task-specific context to each subagent — the market data agent gets market-related instructions and parameters, the competitor agent gets competitor-related context, etc."
        next: "isolated_context"
        score: 2
      - text: "Share the full coordinator conversation history with all subagents so they have complete context"
        next: "shared_context"
        score: 0
      - text: "Give no context beyond the raw query — let each subagent figure out what it needs independently"
        next: "no_context"
        score: 0
  - id: "isolated_context"
    situation: "Good choice. Task-specific context keeps each subagent focused and avoids wasting tokens on irrelevant information. The market data subagent returns structured data successfully. However, the competitor intelligence subagent times out after 30 seconds and returns an empty array `[]`. How do you interpret this result?"
    choices:
      - text: "Investigate — an empty array from a timeout is an access failure, not confirmation that no competitors exist. These must be distinguished."
        next: "error_handling"
        score: 2
      - text: "Accept the empty array as meaning 'no competitors found' and proceed with the report"
        next: "silent_failure"
        score: 0
      - text: "Retry the subagent before doing anything else"
        next: "retry_first"
        score: 1
  - id: "shared_context"
    situation: "Sharing the full coordinator conversation history with all subagents wastes tokens and confuses each subagent with irrelevant information from other research tracks. The market data agent doesn't need competitor analysis context, and vice versa. This leads to degraded performance and unnecessary cost."
    choices:
      - text: "Redesign to pass only task-specific context to each subagent"
        next: "isolated_context"
        score: 1
  - id: "no_context"
    situation: "Without any context, the subagents cannot understand the scope, parameters, or specific focus of their research task. They will produce generic or off-target results. Subagents need focused, task-specific context to operate effectively."
    choices:
      - text: "Provide task-specific context to each subagent"
        next: "isolated_context"
        score: 1
  - id: "error_handling"
    situation: "Correct. You recognize that a timeout producing an empty array is fundamentally different from a successful query that found no results. You implement structured error responses that distinguish access failures from genuine empty results. Now, two subagents return conflicting market size data: $50B from one source (a 2024 audited report) and $75B from another (a 2026 analyst estimate). How do you resolve the discrepancy?"
    choices:
      - text: "Track provenance for each data point — source, confidence level, timestamp, and methodology — then resolve based on reliability and recency"
        next: "provenance_resolution"
        score: 2
      - text: "Average the two numbers to get a reasonable middle ground"
        next: "average_wrong"
        score: 0
      - text: "Use the higher number since it represents growth"
        next: "pick_wrong"
        score: 0
  - id: "silent_failure"
    situation: "Treating a timeout as 'no results' is the **silent error suppression** anti-pattern. Your research report will now state 'no competitors exist in this market' when the reality is you simply couldn't check. This could lead to catastrophically bad business decisions based on false confidence."
    choices:
      - text: "Go back and properly distinguish access failures from empty results"
        next: "error_handling"
        score: 1
  - id: "retry_first"
    situation: "Retrying is a reasonable instinct, but the critical first step is recognizing that this is an **access failure**, not an empty result. If you retry and the retry also times out, you must propagate the error — never silently return an empty array as if it were a valid 'no results' response."
    choices:
      - text: "Add proper error categorization before implementing retry logic"
        next: "error_handling"
        score: 1
  - id: "provenance_resolution"
    situation: "Excellent. You attach provenance metadata to each data point: source name, confidence level (verified > extracted > inferred > estimated), timestamp, and methodology. This allows downstream consumers to evaluate the reliability of each claim. Now for the final synthesis: how do you present the contested market size claim in the research report?"
    choices:
      - text: "Label it as contested with full attribution: 'Market size: $50B (Source A, 2024 audited report) to $75B (Source B, 2026 analyst estimate)'"
        next: "end_proper"
        score: 2
      - text: "Present only the most recent figure ($75B) since newer data supersedes older data"
        next: "end_recency_only"
        score: 1
      - text: "Omit the market size data entirely since it is contested and unreliable"
        next: "end_omitted"
        score: 0
  - id: "average_wrong"
    situation: "Averaging $50B (from a 2024 audited report) and $75B (from a 2026 analyst estimate) produces $62.5B — a number that appears in no source and has no methodological basis. These figures come from different years, different methodologies, and different confidence levels. Averaging them creates a false precision that obscures the actual uncertainty."
    choices:
      - text: "Track provenance metadata to resolve the discrepancy properly"
        next: "provenance_resolution"
        score: 1
  - id: "pick_wrong"
    situation: "Choosing the higher number because 'it represents growth' is selection bias. Without examining source reliability, methodology, and dates, you have no basis for preferring one figure over another. A 2026 estimate may be less reliable than a 2024 audited figure."
    choices:
      - text: "Track provenance metadata to compare source reliability"
        next: "provenance_resolution"
        score: 1
  - id: "end_proper"
    outcome: "Isolated subagent contexts, proper error categorization (access failure vs empty result), provenance tracking with source/confidence/timestamp, contested claims explicitly labeled. This is a production-quality research system that maintains information integrity throughout the multi-agent pipeline."
    total_score: 8
  - id: "end_recency_only"
    outcome: "Recency alone does not determine reliability. A 2026 analyst estimate may be less reliable than a 2024 audited report. Always track full provenance — source, confidence level, timestamp, and methodology — and present contested claims with attribution so readers can judge for themselves."
    total_score: 5
  - id: "end_omitted"
    outcome: "Omitting contested data hides uncertainty from decision-makers. Contested claims should be presented explicitly with full source attribution so readers understand the range of estimates and can apply their own judgment. Suppressing inconvenient data is an integrity failure."
    total_score: 3
---
