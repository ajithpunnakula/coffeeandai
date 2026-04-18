---
title: "Tool Search"
type: concept
tags: [features, claude-code, agent-sdk]
sources: ["raw/scale-to-many-tools-with-tool-search.md", "raw/connect-to-external-tools-with-mcp.md", "raw/give-claude-custom-tools.md"]
---

# Tool Search

Tool Search is a dynamic tool discovery mechanism in [[Claude Code]] and the [[Agent SDK]] that allows agents to work with hundreds or thousands of tools without loading all their schemas into the [[Context Window]] at startup. Instead, tool schemas are deferred and only fetched when the agent determines a tool is relevant to the current task.

Tool Search is enabled by default for [[MCP]] servers. When an MCP server registers tools, only the tool names are loaded initially (consuming minimal context). When the agent needs a specific tool, it calls a `ToolSearch` meta-tool that retrieves the full JSON Schema definition for the requested tools. This pattern is critical for deployments with many MCP servers — without it, the full schemas of all tools would consume a large portion of the context window before any user work begins.

Custom tools defined via in-process MCP servers in the [[Agent SDK]] can also participate in tool search by setting appropriate annotations. Tool annotations include `readOnlyHint`, `destructiveHint`, and `openWorldHint`, which help the agent's tool selection reasoning and [[Permission Modes]] evaluation.

The [[Claude Certified Architect Exam]] identifies hardcoding tool lists instead of using Tool Search as a key anti-pattern — it prevents agents from scaling to new tools without code changes and wastes context on unused tool definitions.

## See also

- [[MCP]], [[Context Window]], [[Agent SDK]]
- [[Source - Scale to Many Tools with Tool Search]]
