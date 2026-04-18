---
id: card_d8c3a1b6
type: scenario
order: 20
difficulty: 3
title: "Scenario: Claude Code for CI/CD Pipelines"
domain: "Claude Code Configuration & Workflows"
wiki_refs: ["Claude Code", "Agent SDK"]
source: "raw/6-exam-scenarios-deep-dive.md"
steps:
  - id: start
    situation: |
      Your engineering team wants to integrate Claude Code into their CI/CD pipeline to perform automated code review on every pull request. The pipeline runs in a headless Linux container with no TTY. How do you run Claude Code in this environment?
    choices:
      - text: "Use the -p flag for non-interactive mode, passing the review prompt as an argument"
        next: p_flag
        score: 1.0
      - text: "Pipe the review instructions into Claude Code's stdin in interactive mode"
        next: stdin_pipe
        score: 0.0
      - text: "Use the Claude web interface and manually trigger reviews"
        next: web_wrong
        score: 0.0
  - id: p_flag
    situation: |
      Good. The -p flag runs Claude Code in non-interactive mode, perfect for CI environments. The review completes and Claude outputs its findings as text. However, your pipeline needs to parse the results programmatically -- extracting severity levels, file paths, and specific issues to post as PR comments. How do you get structured output?
    choices:
      - text: "Use --output-format json combined with --json-schema to enforce a specific response structure"
        next: structured_output
        score: 1.0
      - text: "Parse Claude's natural language output with regex to extract file paths and issues"
        next: regex_parse
        score: 0.0
      - text: "Add instructions in the prompt asking Claude to respond in JSON format"
        next: prompt_json
        score: 0.3
  - id: stdin_pipe
    situation: |
      Interactive mode requires a TTY (terminal) for its interface. CI containers typically run without a TTY, so Claude Code will fail to start or behave unpredictably. The -p flag is specifically designed for non-interactive, headless execution in automated environments.
    choices:
      - text: "Switch to the -p flag for non-interactive mode"
        next: p_flag
        score: 0.5
  - id: web_wrong
    situation: |
      The Claude web interface is designed for interactive human use, not CI/CD automation. It cannot be triggered programmatically by a pipeline, does not support structured output parsing, and would require a human to manually initiate each review. This defeats the purpose of automated CI/CD integration.
    choices:
      - text: "Use the -p flag for non-interactive, automated execution"
        next: p_flag
        score: 0.5
  - id: structured_output
    situation: |
      With --output-format json and --json-schema, Claude Code returns guaranteed-structure JSON that your pipeline parses reliably. The PR review integration is working well. Now your team wants to add a nightly code audit that scans the full codebase for security issues, code smells, and documentation gaps. This audit is not time-sensitive -- results are reviewed the next morning. How do you handle it?
    choices:
      - text: "Use the Message Batches API for 50% cost savings on non-urgent workloads"
        next: batch_decision
        score: 1.0
      - text: "Run synchronous -p calls for each file, same as the PR review"
        next: sync_expensive
        score: 0.3
      - text: "Skip nightly audits -- PR reviews are sufficient"
        next: skip_audit
        score: 0.0
  - id: regex_parse
    situation: |
      Regex parsing of Claude's natural language output is fragile and unreliable. The output format varies between runs: sometimes Claude uses bullet points, sometimes numbered lists, sometimes prose. File paths may appear in different formats. A regex that works today may break tomorrow when Claude phrases its findings differently.
    choices:
      - text: "Use --output-format json with --json-schema for guaranteed structure"
        next: structured_output
        score: 0.5
  - id: prompt_json
    situation: |
      Asking Claude to output JSON via the prompt is better than regex, but it is not guaranteed. Claude may add explanatory text before or after the JSON, use slightly different field names, or produce malformed JSON on edge cases. The --json-schema flag provides schema enforcement at the output layer, guaranteeing the structure regardless of prompt interpretation.
    choices:
      - text: "Use the --json-schema flag for enforced structure"
        next: structured_output
        score: 0.5
  - id: batch_decision
    situation: |
      The Message Batches API processes requests asynchronously at 50% of the standard cost, ideal for non-urgent workloads like nightly audits. Results are available within 24 hours, which is fine for a morning review. The nightly audit is running and finding real issues. Your pipeline now detects a critical security vulnerability in the authentication module. Should the same audit session also generate the fix?
    choices:
      - text: "Use a separate Claude Code session to generate the fix, avoiding confirmation bias"
        next: end_proper
        score: 1.0
      - text: "Have the audit session generate the fix immediately since it already understands the issue"
        next: end_bias
        score: 0.3
  - id: sync_expensive
    situation: |
      Running synchronous requests for a non-urgent nightly audit costs twice as much as necessary. The Message Batches API provides the same quality results at 50% cost for workloads that do not require immediate responses. Since the audit results are reviewed the next morning, the asynchronous processing window is more than sufficient.
    choices:
      - text: "Switch to the Message Batches API for cost efficiency"
        next: batch_decision
        score: 0.5
  - id: skip_audit
    situation: |
      PR reviews only catch issues in changed code. A nightly full-codebase audit catches issues that span multiple PRs, pre-existing problems, and patterns that only become visible at the whole-project level (like inconsistent error handling across modules or security vulnerabilities in unchanged code). Skipping audits misses a significant quality improvement opportunity.
    choices:
      - text: "Implement the nightly audit for comprehensive coverage"
        next: batch_decision
        score: 0.5
  - id: end_proper
    outcome: |
      You built a production-ready CI/CD integration: non-interactive mode with -p for headless execution, --json-schema for guaranteed structured output, the Message Batches API for 50% cost savings on non-urgent nightly audits, and separate sessions for finding and fixing issues to avoid confirmation bias. This architecture is reliable, cost-efficient, and produces trustworthy results.
    total_score: best
  - id: end_bias
    outcome: |
      Having the same session both identify and fix a vulnerability creates confirmation bias. The session retains the reasoning context from the audit, including assumptions about root cause and severity. If the initial diagnosis was slightly wrong, the fix will be wrong in the same way. A separate session approaches the fix fresh, potentially identifying a different root cause or a more comprehensive solution.
    total_score: partial
---
