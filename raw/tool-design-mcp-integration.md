---
title: "Tool Design & MCP Integration"
source: "https://claudecertifications.com/claude-certified-architect/domains/tool-design-mcp"
author: ""
published: 
created: 2026-04-17
description: ""

tags:
  - "clippings"
---

[Skip to content](#main-content)

[Claude Certifications](/)

[Certified Architect](/claude-certified-architect)[Claude 101](/courses/claude-101)[Claude Code](/courses/claude-code-in-action)[AI Fluency](/courses/ai-fluency-foundations)[Videos](/videos)[Practice](/claude-certified-architect/practice-questions)[Exam Guide](/claude-certified-architect/exam-guide)[Register for Exam](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)[Domains](/claude-certified-architect/domains)Domain 2: Tool Design & MCP

Domain 2 · ~20%

# Tool Design & MCP Integration

Design effective tools and integrate with Model Context Protocol (MCP) servers. Covers tool description best practices, structured error responses, tool distribution, MCP configuration, and Claude's built-in tools.

## In This Domain

[d2.1Tool Description Best Practices](#d2.1)[d2.2Structured Error Responses](#d2.2)[d2.3Tool Distribution & Selection](#d2.3)[d2.4MCP Server Configuration](#d2.4)[d2.5Built-in Tools](#d2.5)

d2.1

## Tool Description Best Practices

Write clear, effective tool descriptions that help Claude select and use tools correctly. Include input formats, examples, edge cases, and boundary conditions.

### What makes a good tool description:

Include input format specifications with examples in the tool description

Specify edge cases and boundary conditions so the model handles them correctly

Clear parameter descriptions with expected types, ranges, and constraints

Tool descriptions act as documentation for the model — more detail is better

### Anti-Patterns to Avoid

Vague tool descriptions that leave ambiguity about when or how to use the tool

Missing edge case documentation leading to unexpected tool behavior

Deep Dive — Detailed Explanation, Code & Comparisons

Tool descriptions are the primary mechanism Claude uses to decide **when** and **how** to use a tool. Think of them as documentation written specifically for the model.

**What makes a great tool description:**

•- **Clear purpose**: What the tool does in one sentence

•- **Input specifications**: Exact types, formats, ranges, and constraints

•- **Examples**: Show expected input/output pairs for common cases

•- **Edge cases**: Document what happens with empty inputs, invalid data, boundary values

•- **When NOT to use**: Clarify tool boundaries to prevent misuse

A vague description like "Searches for customers" forces Claude to guess. A detailed description removes all ambiguity: "Search for customers by email, phone, or account ID. Email must include @. Phone must be E.164 format (+1XXXXXXXXXX). Returns max 10 results. Returns empty array if no matches found."

Code Example

tool-description.json — Well-Designed Tool

```
1{

2  "name": "lookup_customer",

3  "description": "Search for a customer by email, phone number, or account ID. Returns customer profile including name, account status, and order history summary. Input: exactly ONE of email, phone, or account_id. Email must contain @. Phone must be E.164 format (e.g., +15551234567). Account ID must start with ACC-. Returns: customer object or empty array if not found. Note: empty result means customer not found, this is NOT an error.",

4  "input_schema": {

5    "type": "object",

6    "properties": {

7      "email": {

8        "type": "string",

9        "description": "Customer email address (must contain @)"

10      },

11      "phone": {

12        "type": "string",

13        "description": "Phone in E.164 format, e.g., +15551234567"

14      },

15      "account_id": {

16        "type": "string",

17        "description": "Account ID starting with ACC-, e.g., ACC-12345"

18      }

19    }

20  }

21}
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
{
  "name": "search",
  "description": "Searches for stuff",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" }
    }
  }
}
// What does it search? What format? When to use?
```

✓Correct

```
{
  "name": "lookup_customer",
  "description": "Search for a customer by email,
    phone (E.164), or account ID (ACC-XXXXX).
    Returns customer profile or empty array
    if not found. Empty result is NOT an error.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string", "desc": "Must contain @" }
    }
  }
}
```

🎯Exam Tip

The exam will present tool descriptions of varying quality. The correct answer always has the most detailed description with input formats, examples, edge cases, and boundary documentation.

d2.2

## Structured Error Responses

Design error responses that give the agent enough information to recover or escalate. Use structured fields like isError, errorCategory, and isRetryable.

### Error response design patterns:

isError flag: explicitly signals tool failure to the agent

errorCategory: classifies errors (e.g., 'validation', 'auth', 'not\_found', 'rate\_limit')

isRetryable: tells the agent whether retrying the same call might succeed

Structured error context: include what was attempted and what failed

### Anti-Patterns to Avoid

Generic error messages like 'Operation failed' that hide useful context

Silently suppressing errors by returning empty results as success

Not distinguishing between access failures and genuinely empty results

Deep Dive — Detailed Explanation, Code & Comparisons

When a tool fails, the error response must give the agent enough information to decide what to do next: retry, try an alternative, or escalate.

**Structured error response fields:**

•- **isError**: Signals this is a failure, not a result (true/false)

•- **errorCategory**: Classifies the error type ("auth", "not\_found", "rate\_limit", "timeout", "validation")

•- **isRetryable**: Should the agent try again? (true for timeouts, false for auth failures)

•- **context**: What was attempted and what specifically failed

**Critical distinction — Access Failure vs Empty Result:**

This is one of the most tested concepts on the exam:

•- **Access Failure**: "I couldn't check the database" → isError: true (the search was NOT performed)

•- **Empty Result**: "I checked the database, found nothing" → isError: false (the search WAS performed)

**Never silently suppress access failures by returning empty results.** If the database was down, returning [] makes the agent think no customers exist — a catastrophic misunderstanding.

Code Example

structured-error.json — Error Response Design

```
1{

2  "access_failure_example": {

3    "isError": true,

4    "errorCategory": "timeout",

5    "isRetryable": true,

6    "context": {

7      "attempted": "Customer lookup by email: [email protected]",

8      "service": "customer-database",

9      "timeout_ms": 5000,

10      "suggestion": "Retry after 2 seconds or try account ID lookup"

11    }

12  },

13  "empty_result_example": {

14    "isError": false,

15    "customers": [],

16    "metadata": {

17      "searched_by": "email",

18      "query": "[email protected]",

19      "results_count": 0

20    }

21  }

22}
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
// Database is DOWN but we return empty results
{
  "customers": []
}
// Agent thinks: "No customers found"
// Reality: "We couldn't even check!"
// This is a SILENT, CATASTROPHIC error
```

✓Correct

```
// Database is DOWN — report it explicitly
{
  "isError": true,
  "errorCategory": "timeout",
  "isRetryable": true,
  "context": {
    "attempted": "Customer lookup by email",
    "suggestion": "Retry or try alternative lookup"
  }
}
// Agent knows the search FAILED and can decide
```

🎯Exam Tip

If an exam question asks about a tool that fails to connect to an external service, the correct answer ALWAYS distinguishes the access failure from an empty result. Returning [] for a failed connection is always wrong.

d2.3

## Tool Distribution & Selection

Distribute tools across agents effectively. Understand the impact of tool count on selection quality and how to scope tool access.

### Tool distribution strategies:

4-5 tools per agent is optimal; too many tools (e.g., 18) degrades selection quality

Scoped tool access: each agent only gets tools relevant to its task

tool\_choice options: 'auto' (model decides), 'any' (must use a tool), or forced specific tool

Tool grouping: organize related tools and assign them to specialized agents

### Anti-Patterns to Avoid

Giving an agent 18+ tools when only 4-5 are relevant to its task

Not using tool\_choice to constrain tool selection when the task is clear

Deep Dive — Detailed Explanation, Code & Comparisons

The number of tools given to a single agent directly impacts its ability to select the correct one. Research shows that **4-5 tools per agent** is optimal.

**Why too many tools is a problem:**

•- With 18+ tools, Claude must evaluate each one against the current task

•- Similar tools create ambiguity (search\_customers vs find\_customer vs lookup\_user)

•- Selection accuracy degrades as the option space grows

•- More tool descriptions consume valuable context window space

**The solution: Distribute tools across specialized subagents**

Instead of one agent with 18 tools, create a coordinator with 3-4 subagents, each having 4-5 focused tools:

•- **Customer Agent**: lookup\_customer, update\_account, check\_status, verify\_identity

•- **Order Agent**: find\_order, process\_refund, update\_shipping, track\_package

•- **Communication Agent**: send\_email, send\_sms, create\_ticket, escalate\_human

•- **Coordinator**: Task (to delegate), summarize, format\_response

**tool\_choice parameter** controls tool selection:

•- "auto" — Claude decides whether and which tool to use (default)

•- "any" — Claude must use a tool (but can choose which)

•- {"type": "tool", "name": "X"} — Force a specific tool

Code Example

tool-distribution.py — Distribute Tools Across Agents

```
1# WRONG: One agent with too many tools

2overloaded_agent = Agent(

3    tools=[

4        lookup_customer, update_account, verify_identity,

5        find_order, process_refund, update_shipping,

6        track_package, send_email, send_sms,

7        create_ticket, escalate, search_kb,

8        check_inventory, apply_coupon, schedule_callback,

9        log_interaction, generate_report, update_preferences,

10    ]  # 18 tools — selection quality degrades!

11)

12

13# CORRECT: Coordinator + specialized subagents

14coordinator = Agent(

15    tools=[Task, summarize_results, format_response],  # 3 tools

16)

17customer_agent = Agent(

18    tools=[lookup_customer, update_account, verify_identity, check_status],

19)

20order_agent = Agent(

21    tools=[find_order, process_refund, update_shipping, track_package],

22)

23comms_agent = Agent(

24    tools=[send_email, send_sms, create_ticket, escalate_human],

25)
```

🎯Exam Tip

When the exam presents a scenario with many tools, the correct answer is ALWAYS distributing them across specialized subagents with 4-5 tools each.

d2.4

## MCP Server Configuration

Configure Model Context Protocol servers for project-level and user-level tool integration. Understand .mcp.json vs ~/.claude.json configuration.

### MCP configuration essentials:

.mcp.json: project-level MCP server configuration (shared with team)

~/.claude.json: user-level MCP configuration (personal tools)

Environment variable expansion in MCP config for secrets management

MCP servers extend Claude's capabilities with custom tools and data sources

### Anti-Patterns to Avoid

Hardcoding secrets in .mcp.json instead of using environment variable expansion

Mixing project-level and user-level configs without understanding precedence

Deep Dive — Detailed Explanation, Code & Comparisons

**Model Context Protocol (MCP)** servers extend Claude's capabilities with custom tools and data sources. Configuration happens at two levels:

**Configuration files:**

•- **.mcp.json** (Project-level) — Shared via version control, team tools, project-specific integrations

•- **~/.claude.json** (User-level) — Personal, not shared, individual API keys

**Security: Environment variable expansion**

Never hardcode secrets in configuration files. Use ${ENV\_VAR} syntax:

•- Secrets stay out of version control

•- Each developer uses their own credentials

•- CI/CD can inject environment-specific values

MCP servers can provide:

•- **Tools**: Custom functions Claude can call (e.g., Jira integration, database queries)

•- **Resources**: Static data or documentation (e.g., API specs, schema docs)

•- **Prompts**: Pre-built prompt templates for common tasks

Code Example

.mcp.json — Project-Level MCP Configuration

```
1{

2  "mcpServers": {

3    "jira": {

4      "command": "npx",

5      "args": ["@company/jira-mcp-server"],

6      "env": {

7        "JIRA_URL": "${JIRA_URL}",

8        "JIRA_TOKEN": "${JIRA_TOKEN}"

9      }

10    },

11    "postgres": {

12      "command": "npx",

13      "args": ["@company/pg-mcp-server", "--read-only"],

14      "env": {

15        "DATABASE_URL": "${DATABASE_URL}"

16      }

17    }

18  }

19}
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
// NEVER hardcode secrets in config files
{
  "mcpServers": {
    "jira": {
      "env": {
        "JIRA_TOKEN": "sk-abc123-actual-secret-key"
      }
    }
  }
}
// This gets committed to git = leaked secrets!
```

✓Correct

```
// Use environment variable expansion
{
  "mcpServers": {
    "jira": {
      "env": {
        "JIRA_TOKEN": "${JIRA_TOKEN}"
      }
    }
  }
}
// Secret stays in environment, not in code
```

🎯Exam Tip

If an exam answer hardcodes API keys in .mcp.json, it's always wrong. The correct approach uses $\{ENV\_VAR} for secrets management.

d2.5

## Built-in Tools

Understand Claude's built-in tools: Read, Write, Edit, Bash, Grep, and Glob. Know when to use each tool for different tasks.

### Built-in tools and their use cases:

Read: read file contents for understanding code or data

Write: create new files from scratch

Edit: modify existing files with targeted changes

Bash: execute shell commands for building, testing, and system operations

Grep: search for patterns across files in a codebase

Glob: find files matching patterns for discovery and navigation

### Anti-Patterns to Avoid

Using Write when Edit would be more precise for modifying existing files

Using Bash for file operations when Read/Write/Edit are available

Deep Dive — Detailed Explanation, Code & Comparisons

Claude Code comes with 6 built-in tools. Knowing **when to use each** is heavily tested on the exam.

**The 6 built-in tools:**

•- **Read** — Read file contents (understanding code, examining data)

•- **Write** — Create new files from scratch (new files only!)

•- **Edit** — Modify existing files with targeted changes

•- **Bash** — Execute shell commands (tests, builds, installs)

•- **Grep** — Search for text patterns across files

•- **Glob** — Find files matching name patterns

**Critical distinctions:**

1.1. **Write vs Edit**: Use Write for **new files only**. Use Edit for **modifying existing files**. Write replaces the entire file.

2.2. **Bash vs built-in tools**: Never use Bash for operations that have dedicated tools. Don't use `cat file.txt` when Read exists.

3.3. **Grep vs Glob**: Grep searches **inside files** for content patterns. Glob searches **file names** for path patterns.

Code Example

built-in-tools-usage.md — Correct Tool Selection

```
1Task: "Read the configuration file"

2  Correct: Read("config.json")

3  Wrong:   Bash("cat config.json")

4

5Task: "Create a new test file"

6  Correct: Write("tests/new-test.ts", content)

7  Wrong:   Bash("echo '...' > tests/new-test.ts")

8

9Task: "Fix a bug in line 42 of server.ts"

10  Correct: Edit("server.ts", old_text, new_text)

11  Wrong:   Write("server.ts", entire_file_content)

12

13Task: "Find all usages of getUserById"

14  Correct: Grep("getUserById", "src/")

15  Wrong:   Bash("grep -r 'getUserById' src/")

16

17Task: "Find all TypeScript test files"

18  Correct: Glob("**/*.test.ts")

19  Wrong:   Bash("find . -name '*.test.ts'")

20

21Task: "Run the test suite"

22  Correct: Bash("npm test")

23  (No built-in alternative — Bash is correct here)
```

🎯Exam Tip

The exam frequently presents scenarios where an agent uses Bash for file operations. The correct answer always uses the purpose-built tool (Read, Write, Edit, Grep, Glob) instead of Bash equivalents.

## Exam Tips for Domain 2

1.

Keep tools per agent to 4-5 for optimal selection quality

2.

Structured error responses are critical — always include isError, errorCategory, isRetryable

3.

Know the difference between .mcp.json (project) and ~/.claude.json (user)

4.

Built-in tools: know when to use Grep vs Glob vs Read

## Related Exam Scenarios

[1

### Customer Support Resolution Agent

Design an AI-powered customer support agent that handles inquiries, resolves issues, and escalates complex cases. Tests Agent SDK usage, MCP tools, and escalation logic.](/claude-certified-architect/scenarios#scenario-1)[4

### Developer Productivity with Claude

Build developer tools using the Claude Agent SDK with built-in tools and MCP servers. Tests tool selection, codebase exploration, and code generation workflows.](/claude-certified-architect/scenarios#scenario-4)

## Test Your Knowledge of Tool Design & MCP

Practice with scenario-based questions covering this domain.

[Practice Questions](/claude-certified-architect/practice-questions)

[Previous Domain

Agentic Architecture](/claude-certified-architect/domains/agentic-architecture)[Next Domain

Claude Code Config](/claude-certified-architect/domains/claude-code-config)

[Claude Certifications](/)

Free courses, study guides, and certification prep for Claude and agentic AI development. Learn at your own pace with hands-on lessons and practice quizzes.

### Courses

* [All Courses](/courses)
* [Claude 101](/courses/claude-101)
* [What Is Claude?](/courses/claude-101/what-is-claude)
* [Claude Projects](/courses/claude-101/introduction-to-projects)
* [Claude Code in Action](/courses/claude-code-in-action)
* [MCP Servers Guide](/courses/claude-code-in-action/mcp-servers)
* [Video Tutorials](/videos)

### Architect Certification

* [12-Week Study Plan](/claude-certified-architect/study-guide)
* [Exam Domains](/claude-certified-architect/domains)
* [Practice Questions](/claude-certified-architect/practice-questions)
* [Exam Guide](/claude-certified-architect/exam-guide)
* [Anti-Patterns](/claude-certified-architect/anti-patterns)
* [FAQ](/claude-certified-architect/faq)

### Quick Links

* [Browse All Courses](/courses)
* [Architect Cert Overview](/claude-certified-architect)
* [Disclaimer & Sources](/disclaimer)

© 2026 claudecertifications.com. All trademarks belong to their respective owners.

Built for the Claude architect community
