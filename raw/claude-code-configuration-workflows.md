---
title: "Claude Code Configuration & Workflows"
source: "https://claudecertifications.com/claude-certified-architect/domains/claude-code-config"
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

[Home](/)[Claude Certified Architect Foundations](/claude-certified-architect)[Domains](/claude-certified-architect/domains)Domain 3: Claude Code Config

Domain 3 · ~20%

# Claude Code Configuration & Workflows

Configure Claude Code for development workflows. Covers CLAUDE.md hierarchy, custom commands and skills, plan mode, iterative refinement, CI/CD integration, and batch processing.

## In This Domain

[d3.1CLAUDE.md Hierarchy & Configuration](#d3.1)[d3.2Custom Commands & Skills](#d3.2)[d3.3Plan Mode & Iterative Refinement](#d3.3)[d3.4CI/CD Integration & Batch Processing](#d3.4)

d3.1

## CLAUDE.md Hierarchy & Configuration

Understand the CLAUDE.md configuration hierarchy and how project, user, and directory-level settings interact.

### CLAUDE.md configuration layers:

User-level: ~/.claude/CLAUDE.md (personal preferences across all projects)

Project-level: .claude/CLAUDE.md (shared team configuration)

Directory-level: CLAUDE.md in any directory (scoped to that directory and below)

@import syntax: include external markdown files for modular configuration

.claude/rules/ directory: topic-specific rule files for organized configuration

### Anti-Patterns to Avoid

Putting all configuration in one massive CLAUDE.md instead of using modular rules

Not understanding the precedence of user vs project vs directory configs

Deep Dive — Detailed Explanation, Code & Comparisons

Claude Code uses a **hierarchical configuration system** with three layers that merge together. Understanding the precedence and purpose of each layer is essential.

**The three configuration layers:**

•- **User** (~/.claude/CLAUDE.md) — Personal preferences, not shared. Example: editor prefs, terminal settings.

•- **Project** (.claude/CLAUDE.md) — Team standards, shared via git. Example: language, framework, coding standards.

•- **Directory** (src/api/CLAUDE.md) — Scoped to that directory and below. Example: API-specific rules, module conventions.

**Precedence**: More specific configs override more general ones. Directory-level > Project-level > User-level.

**Modular configuration** with @import and .claude/rules/:

•- Split rules into topic-specific files instead of one massive CLAUDE.md

•- `@import ./rules/typescript.md` pulls in TypeScript-specific rules

•- Files in .claude/rules/ directory are auto-loaded as rule sets

•- Rules can have path-specific scope using YAML frontmatter with `paths` glob patterns

This modular approach makes rules easier to find, maintain, and allows different team members to own different rule files.

Code Example

Configuration Hierarchy — File Structure

```
1~/.claude/

2  CLAUDE.md                    # USER LEVEL (personal, not shared)

3    "Use vim keybindings"

4    "Prefer dark theme output"

5

6project/

7  .claude/

8    CLAUDE.md                  # PROJECT LEVEL (shared via git)

9      "Use TypeScript with strict mode"

10      "Follow ESLint airbnb config"

11      "@import ./rules/api-design.md"

12    rules/

13      typescript.md            # Auto-loaded rule file

14      testing.md               # Auto-loaded rule file

15      api-design.md            # Imported by CLAUDE.md

16    commands/

17      review.md                # /review slash command

18      deploy.md                # /deploy slash command

19    skills/

20      refactor/

21        SKILL.md               # Refactoring skill (forked context)

22

23  src/

24    api/

25      CLAUDE.md                # DIRECTORY LEVEL (scoped rules)

26        "All endpoints must validate auth tokens"

27        "Use Zod schemas for request validation"
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# One massive CLAUDE.md with everything mixed
# .claude/CLAUDE.md (800 lines)
Use TypeScript strict mode.
Follow ESLint airbnb.
Use vim keybindings.     # Personal pref in project config!
REST endpoints follow...
All functions need tests...
API auth validation...   # Should be directory-scoped
...800 more lines
```

✓Correct

```
# Modular: split by concern and scope
# .claude/CLAUDE.md (project)
  Use TypeScript strict mode.
  @import ./rules/testing.md

# ~/.claude/CLAUDE.md (personal)
  Use vim keybindings.

# src/api/CLAUDE.md (directory-scoped)
  All endpoints must validate auth tokens.

# .claude/rules/testing.md (topic-specific)
  Every function needs unit tests.
```

🎯Exam Tip

Personal preferences go in user-level config. Team standards go in project-level. Module-specific rules go in directory-level. If an answer puts personal preferences in project config, it's wrong.

d3.2

## Custom Commands & Skills

Create custom slash commands and skills to extend Claude Code's capabilities for your team.

### Commands and skills system:

Custom slash commands: .claude/commands/ directory for team-shareable shortcuts

Skills: .claude/skills/ directory with SKILL.md for complex, reusable behaviors

SKILL.md frontmatter: context: fork, allowed-tools, argument-hint

Path-specific rules: YAML frontmatter with paths glob patterns for targeted configuration

### Anti-Patterns to Avoid

Using commands when skills (with forked context) would be more appropriate

Not specifying allowed-tools in skills, leaving overly broad tool access

Deep Dive — Detailed Explanation, Code & Comparisons

Claude Code supports two extension mechanisms: **custom commands** and **skills**. Understanding when to use each is critical.

**Custom Commands** (.claude/commands/):

•- Simple slash commands like /review, /deploy, /test

•- Defined as markdown files with instructions

•- Run in the **current session context** (same context window)

•- Good for quick, one-step actions

•- Shared with team via version control

**Skills** (.claude/skills/):

•- Complex, multi-step reusable behaviors

•- Defined as SKILL.md files with YAML frontmatter

•- Can **fork context** (isolated execution without polluting main session)

•- Can **restrict tool access** via allowed-tools

•- Good for complex operations that need isolation

**SKILL.md frontmatter fields:**

•- `context: fork` — Run in isolated context

•- `allowed-tools` — Restrict which tools the skill can use (e.g., [Read, Edit, Grep])

•- `argument-hint` — Describe the expected argument

**When to use which:**

•- **Command**: "Run lint and show me the errors" → simple, no isolation needed

•- **Skill**: "Refactor this module to use dependency injection" → complex, needs context isolation

Code Example

.claude/skills/refactor/SKILL.md

```
1---

2context: fork

3allowed-tools:

4  - Read

5  - Edit

6  - Grep

7argument-hint: "file or directory to refactor"

8---

9

10# Refactoring Skill

11

12When asked to refactor code, follow these steps:

13

141. **Analyze** the current code structure using Read and Grep

152. **Identify** patterns that violate SOLID principles

163. **Plan** the refactoring approach before making changes

174. **Apply** changes incrementally using Edit (never Write)

185. **Verify** each change maintains existing behavior

19

20## Rules

21- Never delete existing tests

22- Preserve all public API signatures

23- Add JSDoc comments to refactored functions
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Using a command for complex exploration
# .claude/commands/refactor.md
Refactor the given code to use dependency injection.
Look through all files and restructure the codebase.
# Runs in main context, pollutes it with exploration
# noise. No tool restrictions.
```

✓Correct

```
# Using a skill with forked context
# .claude/skills/refactor/SKILL.md
---
context: fork       # Isolated from main context
allowed-tools:      # Restricted tool access
  - Read
  - Edit
  - Grep
---
Refactor the given code to use DI.
# Exploration stays in the fork. Restricted tools.
```

🎯Exam Tip

If the task requires context isolation or tool restriction, the answer is a skill (not a command). Look for context: fork and allowed-tools in the correct answer.

d3.3

## Plan Mode & Iterative Refinement

Use plan mode for complex tasks and iterative refinement patterns to improve output quality progressively.

### Planning and iteration strategies:

Plan mode: think before acting — useful for complex multi-step tasks

Direct execution: appropriate for well-defined, simple tasks

Iterative refinement: concrete examples, TDD iteration, interview pattern

TDD iteration: write tests first, then implement, then refine until tests pass

### Anti-Patterns to Avoid

Using plan mode for simple, well-defined tasks (unnecessary overhead)

Skipping planning for complex tasks that need architectural thinking first

Deep Dive — Detailed Explanation, Code & Comparisons

**Plan mode** tells Claude to think and outline an approach before executing. Critical for complex tasks, wasteful for simple ones.

**When to use plan mode:**

•- Multi-file architectural changes

•- Tasks affecting many interconnected components

•- Situations where mistakes are expensive to undo

•- New feature implementation requiring design decisions

**When to use direct execution:**

•- Simple, well-defined tasks (fix a typo, add a log statement)

•- Single-file changes with clear scope

•- Tasks where the correct approach is obvious

**Iterative refinement patterns:**

•- **Concrete examples**: "Here's what I want: [specific example]" → formatting, style

•- **TDD iteration**: Write tests → implement → test → refine → repeat

•- **Interview pattern**: "Ask me 3 questions before you start" → ambiguous requirements

**The TDD iteration cycle** gives Claude a concrete, verifiable goal at each step:

1.1. Write failing test → defines expected behavior

2.2. Implement → make the test pass

3.3. Run tests → verify correctness

4.4. Refine → improve code quality while keeping tests green

5.5. Repeat for next requirement

This dramatically improves output quality compared to "implement this feature."

Code Example

TDD Iteration with Claude Code

```
1# Step 1: Write the test first (defines the goal)

2You: "Write a test for getUserById that:

3      - Returns user with id, name, email

4      - Throws NotFoundError if user doesn't exist

5      - Validates that id is a positive integer"

6

7# Step 2: Run the test (should fail)

8You: "Run the test"

9Claude: "Test fails: getUserById is not defined"

10

11# Step 3: Implement to pass the test

12You: "Implement getUserById to pass all tests"

13Claude: [implements the function]

14

15# Step 4: Run tests again (should pass)

16You: "Run the tests"

17Claude: "All 3 tests pass"

18

19# Step 5: Refine the implementation

20You: "Add input sanitization and connection pooling,

21      keeping all tests green"
```

🎯Exam Tip

For complex multi-file tasks use plan mode. For simple fixes use direct execution. TDD iteration (write test, implement, verify) is the preferred refinement pattern.

d3.4

## CI/CD Integration & Batch Processing

Integrate Claude Code into CI/CD pipelines using the -p flag and structured output. Leverage batch processing for cost optimization.

### CI/CD and batch processing patterns:

-p flag: run Claude Code in non-interactive mode for CI/CD pipelines

--output-format json: get structured output for automated processing

--json-schema: enforce specific output schemas

Session context isolation in CI: separate generator and reviewer contexts

Message Batches API: 50% cost savings with 24-hour processing window

custom\_id: track individual requests in batch processing

### Anti-Patterns to Avoid

Using interactive mode in CI/CD pipelines

Same-session self-review (retains reasoning context bias)

Not isolating generator and reviewer sessions in code review pipelines

Deep Dive — Detailed Explanation, Code & Comparisons

Claude Code integrates into CI/CD pipelines using the **-p flag** for non-interactive execution and structured output flags for automated processing.

**Key CI/CD flags:**

•- **-p** — Non-interactive mode (required for CI)

•- **--output-format json** — Structured JSON output for parsing

•- **--json-schema** — Enforce specific output shape

**Session isolation for code review:**

The generator session (that wrote the code) must be **completely separate** from the reviewer session. Why? If the reviewer runs in the same session, it retains the generator's reasoning, creating **confirmation bias**.

**Batch processing** with the Message Batches API:

•- Processes within 24 hours (non-blocking)

•- **50% cost savings** compared to synchronous requests

•- Each request gets a custom\_id for tracking

•- Use for: nightly audits, weekly reviews, non-urgent analysis

•- Don't use for: blocking PR reviews, real-time feedback

Code Example

ci-review.yml — CI/CD Code Review Pipeline

```
1name: Claude Code Review

2on: [pull_request]

3

4jobs:

5  review:

6    runs-on: ubuntu-latest

7    steps:

8      - uses: actions/checkout@v4

9

10      # Use -p flag for non-interactive mode

11      # Use a SEPARATE session from code generation

12      - name: Run Claude Code Review

13        run: |

14          claude -p "Review this PR diff for:

15            1. Functions exceeding 50 lines

16            2. Missing error handling on async ops

17            3. Hardcoded credentials or API keys

18            4. Missing unit tests for new functions

19          Provide results as structured JSON." \

20          --output-format json \

21          --json-schema '{

22            "type": "object",

23            "properties": {

24              "issues": {

25                "type": "array",

26                "items": {

27                  "type": "object",

28                  "properties": {

29                    "file": {"type": "string"},

30                    "severity": {"type": "string"},

31                    "description": {"type": "string"}

32                  }

33                }

34              }

35            }

36          }'
```

Compare: Anti-Pattern vs Correct Approach

✗Anti-Pattern

```
# Same-session self-review
claude -p "Write a new auth module"  # Session A
claude --resume -p "Review your code"  # SAME session!
# Reviewer retains reasoning context = confirmation bias
```

✓Correct

```
# Separate session for review
claude -p "Write a new auth module"   # Session A
claude -p "Review this diff: ..."     # Session B (fresh)
# Reviewer has no context from generation
```

🎯Exam Tip

Three must-know CI/CD facts: (1) Always use -p for non-interactive mode. (2) Never self-review in the same session. (3) Use Batch API for non-urgent reviews (50% savings).

## Exam Tips for Domain 3

1.

Know the CLAUDE.md hierarchy: user > project > directory

2.

Understand when to use plan mode vs direct execution

3.

CI/CD uses -p flag with --output-format json for automation

4.

Batch API offers 50% savings — know when to use synchronous vs batch

## Related Exam Scenarios

[2

### Code Generation with Claude Code

Configure Claude Code for a development team workflow. Tests CLAUDE.md configuration, plan mode, slash commands, and iterative refinement strategies.](/claude-certified-architect/scenarios#scenario-2)[4

### Developer Productivity with Claude

Build developer tools using the Claude Agent SDK with built-in tools and MCP servers. Tests tool selection, codebase exploration, and code generation workflows.](/claude-certified-architect/scenarios#scenario-4)[5

### Claude Code for CI/CD

Integrate Claude Code into continuous integration and delivery pipelines. Tests -p flag usage, structured output, batch API, and multi-pass code review.](/claude-certified-architect/scenarios#scenario-5)

## Test Your Knowledge of Claude Code Config

Practice with scenario-based questions covering this domain.

[Practice Questions](/claude-certified-architect/practice-questions)

[Previous Domain

Tool Design & MCP](/claude-certified-architect/domains/tool-design-mcp)[Next Domain

Prompt Engineering](/claude-certified-architect/domains/prompt-engineering)

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
