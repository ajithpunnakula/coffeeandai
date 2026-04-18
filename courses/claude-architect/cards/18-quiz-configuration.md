---
id: card_c6b4d9a3
type: quiz
order: 18
difficulty: 2
title: "Quiz: Claude Code Configuration"
domain: "Claude Code Configuration & Workflows"
wiki_refs: ["CLAUDE.md File", "Skills"]
pass_threshold: 0.8
questions:
  - prompt: "A developer wants to enforce team coding standards (naming conventions, test requirements, forbidden patterns) so that every team member's Claude Code session follows the same rules. Where should these rules be placed?"
    objective: "Identify the correct CLAUDE.md hierarchy level for team-shared configuration"
    source: "raw/claude-code-configuration-workflows.md"
    choices:
      - text: "In .claude/CLAUDE.md at the project root, which is version-controlled and shared with the team"
        correct: true
        feedback: "Correct. Project-level CLAUDE.md is committed to the repository, ensuring all team members receive the same instructions."
      - text: "In ~/.claude/CLAUDE.md on each developer's machine"
        correct: false
        misconception: "Personal user-level config is sufficient for enforcing team standards"
        feedback: "User-level config is per-developer and not version-controlled. There is no way to ensure every team member has the same rules, and they will drift over time."
      - text: "As inline code comments throughout the codebase"
        correct: false
        misconception: "Code comments serve the same purpose as CLAUDE.md instructions"
        feedback: "Claude Code reads CLAUDE.md files for instructions, not inline comments. Comments may influence behavior incidentally, but they are not a reliable or structured configuration mechanism."
      - text: "In a .env file at the project root"
        correct: false
        misconception: "Environment variables can control Claude Code's coding style and conventions"
        feedback: "Environment variables configure runtime behavior like API keys, not coding standards. CLAUDE.md is the designated mechanism for instructing Claude Code about project conventions."
  - prompt: "A team needs to build a code review skill that explores the codebase extensively to find issues, but they do not want the exploration to clutter the developer's main conversation. The skill should only be able to read files, not modify them. What is the correct approach?"
    objective: "Understand when to use skills with context fork and allowed-tools restriction"
    source: "raw/claude-code-configuration-workflows.md"
    choices:
      - text: "Create a skill with context: fork and allowed-tools restricted to Read, Grep, and Glob"
        correct: true
        feedback: "Correct. context: fork isolates the exploration from the main session, and allowed-tools enforces read-only access."
      - text: "Create a command in .claude/commands/ with a note saying 'do not modify files'"
        correct: false
        misconception: "Commands and skills are interchangeable and natural language restrictions are enforced"
        feedback: "Commands run in the main session context with full tool access. A natural language instruction to not modify files is not enforced -- Claude could still use write tools. Skills provide structural isolation and tool restrictions."
      - text: "Open a new terminal window and run Claude Code there for the review"
        correct: false
        misconception: "Manual session management is equivalent to skill-based context isolation"
        feedback: "A new terminal session lacks the skill's argument passing, tool restrictions, and structured output. It also requires manual context setup and cannot be invoked programmatically."
      - text: "Use plan mode to review the code without making changes"
        correct: false
        misconception: "Plan mode provides context isolation and tool restriction"
        feedback: "Plan mode controls whether Claude plans before acting, not whether it has tool access or session isolation. It does not restrict tools and does not fork the context."
  - prompt: "A developer needs to refactor an authentication module that spans 5 interconnected files (routes, middleware, service, repository, and tests). The changes to each file depend on decisions made in the others. What is the most appropriate workflow?"
    objective: "Identify when plan mode is the correct workflow choice"
    source: "raw/claude-code-configuration-workflows.md"
    choices:
      - text: "Use plan mode to outline the full refactoring approach across all 5 files, review the plan, then execute with TDD iteration"
        correct: true
        feedback: "Correct. Plan mode lets you see the full architectural picture before committing to changes, and TDD iteration provides verifiable checkpoints during implementation."
      - text: "Start editing the first file directly and let Claude figure out the dependencies as it goes"
        correct: false
        misconception: "Direct execution is always faster and Claude will handle cross-file dependencies automatically"
        feedback: "Without planning, Claude may make choices in early files that create conflicts with later files. Multi-file refactoring with interconnected dependencies benefits from seeing the full picture first."
      - text: "Use plan mode for every single task regardless of complexity to ensure maximum accuracy"
        correct: false
        misconception: "Plan mode is always better and should be the default workflow"
        feedback: "Plan mode adds overhead. For simple single-file changes, it wastes time generating an architectural overview for something that needs no architecture. Match the tool to the task complexity."
      - text: "Write all 5 files at once without tests, then run the full test suite at the end"
        correct: false
        misconception: "Batch implementation followed by batch testing is equally effective as incremental TDD"
        feedback: "Implementing everything before testing means bugs compound. Each change may build on a flawed foundation. TDD catches issues at each step, keeping correctness verifiable incrementally."
---
