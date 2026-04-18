---
id: card_f4b9c3a7
type: quiz
order: 12
difficulty: 2
title: "Quiz: Tool Design and MCP"
domain: "Tool Design & MCP Integration"
wiki_refs: ["MCP", "Structured Output"]
pass_threshold: 0.8
questions:
  - prompt: "A database lookup tool returns an empty array `[]` when the database connection times out. A user asks the agent 'Are there any open support tickets?' and the agent responds 'No open tickets found.' What is the fundamental problem with this tool's error handling?"
    objective: "Distinguish access failure from empty result in tool error responses"
    source: "raw/tool-design-mcp-integration.md"
    choices:
      - text: "The agent is treating an access failure as an empty result — it could not connect to the database but reported that no tickets exist, which is a catastrophic misunderstanding"
        correct: true
        feedback: "Correct. Returning [] on a timeout disguises an access failure as a successful empty query. The agent cannot distinguish 'nothing found' from 'could not check' and confidently gives the user wrong information."
      - text: "An empty array is a perfectly valid response for a timeout — the agent just needs to check again after a delay"
        correct: false
        misconception: "Believing an empty array is a valid representation of a connection failure"
        feedback: "An empty array signals 'checked and found nothing.' A timeout means the tool never checked at all. These are fundamentally different states that require different responses from the agent."
      - text: "The agent should automatically retry the query, which would fix the issue without changing the error format"
        correct: false
        misconception: "Assuming retry logic alone solves the access-failure-vs-empty-result ambiguity"
        feedback: "Retry might eventually succeed, but the agent first needs to know the call failed. Without an isError flag and isRetryable field, the agent has no signal that a retry is needed — it thinks the query succeeded."
      - text: "The agent should infer from context that a timeout occurred and tell the user to wait"
        correct: false
        misconception: "Expecting the model to infer infrastructure failures from an empty result"
        feedback: "The agent receives only the tool's return value. If that value is [], there is no contextual signal that a timeout occurred. The tool must explicitly communicate failure through structured error fields."
  - prompt: "A development team's Claude Code agent has access to 18 tools and frequently selects the wrong one for file operations. They've already written detailed tool descriptions with examples. What is the most effective architectural fix?"
    objective: "Apply the tool count threshold and coordinator-subagent pattern"
    source: "raw/tool-design-mcp-integration.md"
    choices:
      - text: "Distribute the tools across specialized subagents with 4-5 tools each, coordinated by a routing agent"
        correct: true
        feedback: "Correct. Above ~5 tools per agent, selection accuracy degrades regardless of description quality. The coordinator-subagent pattern gives each agent a focused, manageable tool set."
      - text: "Write even longer and more detailed tool descriptions with multiple examples and edge cases"
        correct: false
        misconception: "Believing that more detailed descriptions can overcome the tool count threshold"
        feedback: "The team has already written detailed descriptions. The problem is not description quality — it is that 18 tools create too much ambiguity for a single agent to reason about. The fix is architectural, not textual."
      - text: "Upgrade to a larger Claude model with more reasoning capacity to handle the tool selection"
        correct: false
        misconception: "Assuming a larger model eliminates tool selection degradation at high tool counts"
        feedback: "Tool selection degradation above ~5 tools is a fundamental limitation, not a model size issue. A larger model may reason slightly better but will still struggle with 18 competing tool descriptions."
      - text: "Add retry logic so the agent tries again with a different tool when the first selection fails"
        correct: false
        misconception: "Treating tool misselection as a transient error that retries can fix"
        feedback: "Retry does not help if the agent consistently picks the wrong tool due to ambiguity. Each retry wastes tokens and time. The root cause — too many tools per agent — must be addressed structurally."
  - prompt: "A team is configuring an MCP server for their project that requires an API key. They want the configuration to work for all developers and in CI/CD. Where should the API key be stored?"
    objective: "Apply MCP secret management best practices"
    source: "raw/tool-design-mcp-integration.md"
    choices:
      - text: "Use ${ENV_VAR} syntax in .mcp.json to reference an environment variable, with the actual key set in each developer's shell environment and CI/CD secrets"
        correct: true
        feedback: "Correct. The ${ENV_VAR} interpolation syntax in .mcp.json keeps secrets out of version control while allowing the project-level config to be shared. Each environment provides the actual value."
      - text: "Put the API key directly in .mcp.json since it's the project-level config and will be accessible to everyone"
        correct: false
        misconception: "Conflating project-level configuration with secret storage, treating .mcp.json as a safe place for credentials"
        feedback: ".mcp.json is version-controlled and will expose the API key in git history. Secrets must never be hardcoded in any version-controlled file. Use ${ENV_VAR} syntax instead."
      - text: "Store the API key in ~/.claude.json since it's the user-level config and won't be committed to version control"
        correct: false
        misconception: "Confusing user-level config with the correct secret management mechanism for shared projects"
        feedback: "~/.claude.json is personal and machine-specific — it won't be available to other developers or in CI/CD. The project needs .mcp.json with ${ENV_VAR} references so the config is shared but the secret is not."
      - text: "Hardcode the API key in the MCP server's source code with a comment to rotate it regularly"
        correct: false
        misconception: "Believing that rotating secrets compensates for hardcoding them in source code"
        feedback: "Hardcoded secrets in source code are exposed in version control history even after rotation. The key will persist in every commit that contained it. Environment variables are the correct approach."
---
