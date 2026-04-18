---
title: "Agentic Architecture & Orchestration"
source: "https://claudecertifications.com/claude-certified-architect/domains/agentic-architecture"
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

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)[Domains](/claude-certified-architect/domains)Domain 1: Agentic Architecture

Domain 1 · ~25%

# Agentic Architecture & Orchestration

Design and implement agentic systems using Claude's Agent SDK. Covers agentic loops, multi-agent orchestration, hooks, workflows, session management, and task decomposition patterns for production-grade AI applications.

## In This Domain

[d1.1Agentic Loops & Core API](#d1.1)[d1.2Multi-Agent Orchestration](#d1.2)[d1.3Hooks & Programmatic Enforcement](#d1.3)[d1.4Session Management & Workflows](#d1.4)

d1.1

## Agentic Loops & Core API

Understand how agentic loops work using the Claude Agent SDK. Learn to manage the lifecycle of agentic interactions, including the stop\_reason signals, tool result appending, and the control flow of agent execution.

### Core concepts you must master for the exam:

Agentic loop lifecycle: stop\_reason values ('tool\_use' vs 'end\_turn') control loop continuation

Tool result appending: after each tool call, results are appended to the conversation for the next iteration

Agent SDK control flow: the SDK handles the loop automatically, but you must understand the mechanics

The agent continues looping as long as stop\_reason is 'tool\_use'; it terminates on 'end\_turn'

### Anti-Patterns to Avoid

Parsing natural language output to decide whether to continue the loop instead of checking stop\_reason

Setting arbitrary iteration caps as the primary stopping mechanism

Checking assistant text content to determine loop termination

Deep Dive — Detailed Explanation, Code & Comparisons

The agentic loop is the core execution pattern for Claude-based agents. Unlike simple request-response interactions, an agentic loop allows Claude to **iteratively plan, act, observe, and decide** whether to continue or stop.

**How the loop works:**

1.1. You send a message to Claude with a set of available tools

2.2. Claude responds — either with text (done) or a tool call (needs to act)

3.3. If Claude called a tool, you execute it and append the result to the conversation

4.4. You send the updated conversation back to Claude

5.5. Repeat until Claude responds with text only (no more tool calls)

The **`stop\_reason`** field in the API response is the **only reliable signal** for controlling this loop:

•- **`"tool\_use"`** → Claude wants to call a tool → continue the loop

•- **`"end\_turn"`** → Claude is done → exit the loop and return the response

The Agent SDK handles this loop automatically, but you must understand the mechanics because the exam tests your knowledge of **why** certain approaches work and why alternatives fail.

Code Example

agentic-loop.py — Core Loop Pattern

```
1import anthropic

2

3client = anthropic.Anthropic()

4tools = [{"name": "lookup_customer", "description": "...", "input_schema": {}}]

5messages = [{"role": "user", "content": "Find customer John Smith"}]

6

7# The Agentic Loop

8while True:

9    response = client.messages.create(

10        model="claude-sonnet-4-20250514",

11        max_tokens=4096,

12        tools=tools,

13        messages=messages

14    )

15

16    # KEY: Check stop_reason to control the loop

17    if response.stop_reason == "end_turn":

18        break  # Claude is done

19

20    if response.stop_reason == "tool_use":

21        tool_block = next(

22            b for b in response.content if b.type == "tool_use"

23        )

24        result = execute_tool(tool_block.name, tool_block.input)

25

26        messages.append({"role": "assistant", "content": response.content})

27        messages.append({

28            "role": "user",

29            "content": [{"type": "tool_result",

30                         "tool_use_id": tool_block.id,

31                         "content": result}]

32        })
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# ANTI-PATTERN: Parsing natural language
while True:
    response = get_response()
    text = response.content[0].text
    if "task complete" in text.lower():
        break
    if "I'm done" in text.lower():
        break
```

✓Correct

```
# CORRECT: Check stop_reason field
while True:
    response = get_response()
    if response.stop_reason == "end_turn":
        break  # Claude decided it's done
    if response.stop_reason == "tool_use":
        execute_and_continue()
```

🎯Exam Tip

The exam will present 3-4 options for loop termination. The correct answer is ALWAYS checking stop\_reason. Look for distractors like parsing text content, setting iteration limits, or monitoring token counts.

d1.2

## Multi-Agent Orchestration

Design and implement multi-agent systems using hub-and-spoke architecture. Learn coordinator roles, subagent context isolation, and parallel execution patterns.

### Multi-agent patterns tested on the exam:

Hub-and-spoke architecture: a central coordinator delegates tasks to specialized subagents

Context isolation: subagents have their own context and do not share state directly

Task tool for spawning subagents: allowedTools must include 'Task' for subagent creation

Parallel execution: multiple Task calls in a single response enable parallel subagent work

fork\_session: creates branched sessions for parallel exploration without context pollution

### Anti-Patterns to Avoid

Overly narrow task decomposition leading to coverage gaps between subagents

Sharing full coordinator context with every subagent (context pollution)

Not providing explicit context when delegating to subagents

Deep Dive — Detailed Explanation, Code & Comparisons

Multi-agent orchestration uses a **hub-and-spoke** architecture where a central **coordinator** delegates tasks to specialized **subagents**. Each subagent operates in its own isolated context and returns results to the coordinator.

**Why hub-and-spoke beats flat architectures:**

•- **Context isolation**: Each subagent gets only context relevant to its task

•- **Focused tool access**: Each subagent has only 4-5 tools relevant to its specialty

•- **Parallel execution**: Multiple subagents can work simultaneously

•- **Clean synthesis**: Coordinator combines results without exploration noise

**The Task tool** spawns subagents. Critical configuration:

•- The coordinator's allowedTools must include "Task" to enable subagent spawning

•- Each Task call specifies the subagent's prompt, tools, and context

•- Multiple Task calls in a single response execute **in parallel**

**Context passing rule**: Pass ONLY the context specific to each subagent's task. Never share the full coordinator conversation history — it wastes tokens and confuses the subagent with irrelevant information.

Code Example

hub-and-spoke.py — Multi-Agent Coordinator

```
1from claude_agent import Agent, Task

2

3coordinator = Agent(

4    model="claude-sonnet-4-20250514",

5    tools=[

6        Task,              # Required for spawning subagents

7        summarize_results, # Coordinator-level synthesis

8        format_report,     # Final output formatting

9    ]

10)

11

12# Subagent with scoped tool access (4 tools each)

13market_researcher = Agent(

14    model="claude-sonnet-4-20250514",

15    tools=[web_search, read_doc, extract_data, format_citation],

16)

17

18tech_analyst = Agent(

19    model="claude-sonnet-4-20250514",

20    tools=[read_code, grep_patterns, analyze_deps, format_report],

21)

22

23# Coordinator delegates with EXPLICIT context per subtask

24coordinator.run("""

25Research AI infrastructure market. Delegate:

261. Market research → market_researcher

272. Technology analysis → tech_analyst

28Pass each subagent ONLY the context relevant to their task.

29""")
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Sharing FULL coordinator context with subagent
Task(
    prompt="Research market size",
    context=coordinator.full_conversation_history,
    # 90% of this context is irrelevant
)
```

✓Correct

```
# Passing EXPLICIT relevant context per subtask
Task(
    prompt="Research AI infrastructure market size",
    context="Focus: market size in USD, YoY growth, top 3 vendors",
    # Only what this subagent needs
)
```

🎯Exam Tip

The exam tests context isolation heavily. If an answer shares full coordinator context with subagents, it's wrong. Each subagent should receive only context specific to its assigned subtask.

d1.3

## Hooks & Programmatic Enforcement

Use hooks for data normalization, tool call interception, and compliance enforcement. Understand when to use programmatic enforcement vs prompt-based guidance.

### Hooks and enforcement concepts:

PostToolUse hooks: intercept and modify tool outputs for data normalization

Programmatic enforcement for critical business rules (deterministic, not probabilistic)

Prompt-based guidance for soft preferences and style suggestions

Hook-based blocking: e.g., blocking refunds above $500 and redirecting to escalation

### Anti-Patterns to Avoid

Using prompt-based enforcement for critical business rules (unreliable)

Self-reported confidence scores for escalation decisions (model confidence is unreliable)

Sentiment-based escalation (sentiment does not equal complexity)

Deep Dive — Detailed Explanation, Code & Comparisons

**Hooks** provide deterministic, programmatic enforcement of business rules. They intercept tool calls before or after execution, allowing you to block, modify, or augment behavior without relying on the model's compliance.

**The critical distinction the exam tests:**

•- **Hooks** = Deterministic (100% reliable) → Use for critical business rules, compliance, security

•- **Prompts** = Probabilistic (model may ignore) → Use for style preferences, soft guidelines

**Types of hooks:**

•- **PreToolUse**: Intercepts before tool execution — can block, modify params, add validation

•- **PostToolUse**: Intercepts after execution — can modify output, normalize data, trigger side effects

**Example**: A $500 refund limit is a critical business rule. If you put it in a prompt, the model might process a $700 refund anyway. A PostToolUse hook **guarantees** the block.

**Valid escalation triggers:**

•- Customer explicitly requests a human

•- Policy gap detected (no rule covers the situation)

•- Task exceeds agent capabilities

•- Business threshold exceeded (e.g., refund > $500)

**Invalid triggers (anti-patterns):**

•- Negative sentiment (sentiment does not equal task complexity)

•- Self-reported low confidence (model confidence is unreliable)

Code Example

hooks.py — Programmatic Business Rule Enforcement

```
1from claude_agent import Agent, Hook

2

3# PostToolUse hook: Block refunds above $500

4def refund_limit_hook(tool_name, tool_input, tool_output):

5    if tool_name == "process_refund":

6        amount = tool_input.get("amount", 0)

7        if amount > 500:

8            return {

9                "blocked": True,

10                "reason": f"Refund ${amount} exceeds $500 limit",

11                "action": "escalate_to_human",

12                "context": {

13                    "customer_id": tool_input.get("customer_id"),

14                    "requested_amount": amount,

15                    "agent_limit": 500,

16                }

17            }

18    return tool_output  # Allow all other tool calls

19

20agent = Agent(

21    model="claude-sonnet-4-20250514",

22    tools=[lookup_customer, check_order, process_refund],

23    hooks={"PostToolUse": [refund_limit_hook]},

24)
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# ANTI-PATTERN: Prompt-based enforcement
system_prompt = """
IMPORTANT: Never process refunds above $500.
If a refund is above $500, escalate to a human.
"""
# This is probabilistic — the model CAN and
# WILL sometimes ignore this instruction
```

✓Correct

```
# CORRECT: Hook-based enforcement
def refund_limit_hook(tool_name, tool_input, output):
    if tool_name == "process_refund":
        if tool_input["amount"] > 500:
            return {"blocked": True, "action": "escalate"}
    return output
# This runs as CODE, not as a suggestion
```

🎯Exam Tip

When the exam asks about enforcing critical business rules (refund limits, data access, compliance), the correct answer is ALWAYS programmatic hooks, never prompt instructions.

d1.4

## Session Management & Workflows

Manage agent sessions, including resuming, forking, and preventing stale context. Understand task decomposition strategies from prompt chaining to dynamic adaptive decomposition.

### Session and workflow management:

--resume flag: continue previous sessions with preserved context

fork\_session: branch sessions for exploration without polluting the main context

Named sessions for organized multi-session workflows

Stale context detection and mitigation in long-running sessions

Prompt chaining vs dynamic adaptive decomposition: choose based on task predictability

### Anti-Patterns to Avoid

Ignoring stale context in extended sessions

Using static prompt chains for tasks that require dynamic adaptation

Deep Dive — Detailed Explanation, Code & Comparisons

**Session management** controls how agent conversations persist, resume, and branch.

**Key session operations:**

•- **Resume** (`--resume`): Continue a previous session with full context

•- **Fork** (`fork_session`): Create a branch for exploration without polluting the main session

•- **Named sessions** (`--session-name`): Organize multi-session workflows

**Stale context** is a critical risk in long-running sessions — data retrieved early may become outdated. Mitigation: periodically re-fetch critical data, use scratchpad files.

**Task decomposition strategies:**

•- **Prompt chaining**: Predictable, linear tasks with static sequence of steps

•- **Dynamic adaptive**: Unpredictable, complex tasks where the agent decides next steps based on results

Dynamic adaptive decomposition is preferred when the task has unknown complexity or intermediate results may change the approach. Prompt chaining works when the workflow is well-defined and each step's input/output is predictable.

Code Example

session-management.sh — Session Operations

```
1# Resume a previous session (preserves full context)

2claude --resume

3

4# Resume a specific named session

5claude --resume --session-name "feature-auth-redesign"

6

7# Fork for exploration (inherits context, diverges)

8# Changes in fork do NOT affect the main session

9claude fork_session --reason "Exploring alternative API"

10

11# Start a new named session

12claude --session-name "sprint-47-backend"
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Static prompt chain for a DYNAMIC task
steps = [
    "Step 1: Read the codebase",
    "Step 2: Find all bugs",
    "Step 3: Fix each bug",
]
# What if step 2 finds no bugs?
# Static chains can't adapt
```

✓Correct

```
# Dynamic adaptive decomposition
agent.run("""
Analyze the codebase for issues. For each:
1. Assess severity and complexity
2. If simple: fix directly
3. If complex: create a plan first
4. After each fix: run relevant tests
Adapt your approach based on what you find.
""")
```

🎯Exam Tip

If the task is unpredictable or has conditional branches, dynamic adaptive decomposition is correct. If it's a fixed, linear pipeline, prompt chaining works.

## Exam Tips for Domain 1

1.

Always check stop\_reason for loop control, never parse natural language

2.

Programmatic hooks for business rules, prompts for preferences

3.

Subagents need explicit context — don't assume they inherit coordinator knowledge

4.

Understand fork\_session vs --resume and when to use each

## Related Exam Scenarios

[1

### Customer Support Resolution Agent

Design an AI-powered customer support agent that handles inquiries, resolves issues, and escalates complex cases. Tests Agent SDK usage, MCP tools, and escalation logic.](/claude-certified-architect/scenarios#scenario-1)[3

### Multi-Agent Research System

Build a coordinator-subagent system for parallel research tasks. Tests multi-agent orchestration, context passing, error propagation, and result synthesis.](/claude-certified-architect/scenarios#scenario-3)

## Test Your Knowledge of Agentic Architecture

Practice with scenario-based questions covering this domain.

[Practice Questions](/claude-certified-architect/practice-questions)

[Next Domain

Tool Design & MCP](/claude-certified-architect/domains/tool-design-mcp)

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
