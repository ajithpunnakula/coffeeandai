---
id: card_d1e6f8b2
type: scenario
order: 13
difficulty: 3
title: "Scenario: Developer Productivity with Claude"
domain: "Tool Design & MCP Integration"
wiki_refs: ["MCP", "Claude Code", "Tool Search"]
source: "raw/6-exam-scenarios-deep-dive.md"
steps:
  - id: start
    situation: |
      A developer's Claude Code agent has 18 tools configured and frequently selects the wrong tool for file operations. The developer asks you to fix the architecture. What do you recommend?
    choices:
      - text: "Distribute tools across specialized subagents with 4-5 tools each, using a coordinator to route requests"
        next: agent_redesign
        score: 1.0
      - text: "Write longer, more detailed tool descriptions with examples for each of the 18 tools"
        next: description_path
        score: 0.2
      - text: "Upgrade to a larger Claude model that can handle more tools"
        next: wrong_model
        score: 0.0
  - id: agent_redesign
    situation: |
      Good choice — distributing tools across focused subagents is the correct architectural fix. The developer now needs the file-operations subagent to read a JSON configuration file. Which built-in tool should the subagent use?
    choices:
      - text: "Use the Read tool to read the file contents directly"
        next: correct_tool
        score: 1.0
      - text: "Use Bash('cat config.json') to print the file contents"
        next: bash_cat
        score: 0.3
      - text: "Use the Write tool to open the file for read-then-write access"
        next: wrong_write
        score: 0.0
  - id: description_path
    situation: |
      You've spent time writing verbose descriptions with examples for all 18 tools. The agent's tool selection has improved marginally, but it still frequently misselects between similar tools. The core problem persists. What is the real issue?
    choices:
      - text: "The agent has too many tools — distribute them across specialized subagents with 4-5 each"
        next: back_to_start
        score: 0.8
      - text: "The descriptions need even more examples and edge case documentation"
        next: still_wrong
        score: 0.1
  - id: wrong_model
    situation: |
      A larger model won't fix tool selection degradation. Research shows that above approximately 5 tools per agent, selection accuracy drops regardless of model size. The fundamental issue is the number of tools a single agent must reason about.
    choices:
      - text: "Reconsider the approach and focus on reducing tools per agent"
        next: back_to_start
        score: 0.5
  - id: back_to_start
    situation: |
      You've identified that the core problem is tool count per agent. The coordinator-subagent pattern is the standard solution: a routing agent delegates to specialized subagents, each with a focused set of 4-5 tools. How do you restructure?
    choices:
      - text: "Create a coordinator agent that routes to file-ops, data, and API subagents, each with 4-5 tools"
        next: agent_redesign
        score: 1.0
  - id: correct_tool
    situation: |
      Correct — Read is the purpose-built tool for reading files in Claude Code. The developer now wants to add a project-level MCP server that connects to their team's internal API. The server requires an API key. Where should the secret be stored?
    choices:
      - text: "Use ${ENV_VAR} syntax in .mcp.json, with the actual key in each developer's environment and CI/CD secrets"
        next: end_proper
        score: 1.0
      - text: "Put the API key directly in .mcp.json so all developers have access immediately"
        next: end_leaked
        score: 0.0
      - text: "Store the API key in ~/.claude.json since it's not version-controlled"
        next: end_personal
        score: 0.3
  - id: bash_cat
    situation: |
      Using Bash('cat config.json') technically works but bypasses the purpose-built Read tool. In exam context and production best practice, this is a documented anti-pattern. Purpose-built tools provide better safety checks, structured output, and error handling.
    choices:
      - text: "Switch to using the Read tool for file operations"
        next: correct_tool
        score: 0.7
  - id: wrong_write
    situation: |
      The Write tool is designed for creating or overwriting files, not for reading them. Using Write to read would either fail or produce unexpected behavior. Claude Code has a dedicated Read tool for this purpose.
    choices:
      - text: "Use the Read tool instead to read the configuration file"
        next: correct_tool
        score: 0.7
  - id: still_wrong
    situation: |
      Adding more description detail has diminishing returns when the fundamental problem is tool count. With 18 tools, even perfect descriptions create too much ambiguity for a single agent. The documented solution is distributing tools across subagents.
    choices:
      - text: "Restructure to use specialized subagents with focused tool sets"
        next: agent_redesign
        score: 0.8
  - id: end_proper
    outcome: |
      Tools distributed across focused subagents, purpose-built tools used correctly, secrets secured via environment variables. This is production-ready architecture.
    total_score: best
  - id: end_leaked
    outcome: |
      API keys hardcoded in version-controlled .mcp.json will be exposed in git history. This is a critical security violation.
    total_score: poor
  - id: end_personal
    outcome: |
      User-level config isn't shared with the team and won't work in CI/CD. Project-level .mcp.json with env vars is the correct approach.
    total_score: partial
---
