---
id: card_a2f5e7c8
type: scenario
order: 19
difficulty: 3
title: "Scenario: Code Generation with Claude Code"
domain: "Claude Code Configuration & Workflows"
wiki_refs: ["CLAUDE.md File", "Skills", "Claude Code"]
source: "raw/6-exam-scenarios-deep-dive.md"
steps:
  - id: start
    situation: |
      Your team is starting a new project with 4 developers. You want to configure Claude Code so that everyone follows the same coding standards: consistent naming conventions, required test coverage, and forbidden patterns. Where do you put the team coding standards?
    choices:
      - text: "In .claude/CLAUDE.md at the project root (version-controlled, shared with team)"
        next: project_config
        score: 1.0
      - text: "In ~/.claude/CLAUDE.md on your personal machine and ask teammates to copy it"
        next: personal_config
        score: 0.0
      - text: "In README.md with a section titled 'Claude Code Instructions'"
        next: readme_path
        score: 0.0
  - id: project_config
    situation: |
      Good choice. The project-level CLAUDE.md is committed to version control and automatically loaded for every team member. Now the project has grown and you need to refactor an authentication module that spans 5 interconnected files: routes, middleware, service layer, repository, and tests. How do you approach this refactoring?
    choices:
      - text: "Use plan mode to outline the full multi-file approach before writing any code"
        next: plan_mode
        score: 1.0
      - text: "Start editing files directly -- Claude will figure out the dependencies"
        next: direct_edit
        score: 0.0
      - text: "Create a skill with context: fork to refactor in isolation"
        next: skill_approach
        score: 0.5
  - id: personal_config
    situation: |
      Personal user-level config (~/.claude/CLAUDE.md) is not version-controlled and not shared automatically. Each developer would need to manually copy and maintain the file, leading to configuration drift. When Alice updates a rule, Bob and Carol still have the old version. This does not scale.
    choices:
      - text: "Move the standards to the project-level .claude/CLAUDE.md instead"
        next: project_config
        score: 0.5
  - id: readme_path
    situation: |
      Claude Code does not read README.md for its instructions. It specifically looks for CLAUDE.md files in the hierarchy: user-level, project-level, and directory-level. Your coding standards in README.md will be ignored entirely by Claude Code sessions.
    choices:
      - text: "Use the correct file: .claude/CLAUDE.md at the project root"
        next: project_config
        score: 0.5
  - id: plan_mode
    situation: |
      Plan mode maps out the changes across all 5 files before writing any code. You can see how the route handler changes depend on the middleware updates, which depend on the service interface, and so on. The plan looks solid and you approve it. Now you need to implement the changes. What iteration pattern do you follow?
    choices:
      - text: "TDD: write a failing test for each component, implement to pass it, verify, then move to the next"
        next: tdd_iteration
        score: 1.0
      - text: "Ask Claude to 'make the authentication better' and review what it produces"
        next: vague_instructions
        score: 0.0
      - text: "Implement all 5 files at once, then run the full test suite to check"
        next: test_last
        score: 0.3
  - id: direct_edit
    situation: |
      Without a plan, Claude starts editing the route handler but makes assumptions about the middleware interface that turn out to be wrong. Three files in, you realize the service layer needs a different signature, requiring you to redo the routes and middleware. Multi-file refactoring without planning leads to cascading rework.
    choices:
      - text: "Step back and use plan mode to map out the full approach first"
        next: plan_mode
        score: 0.5
  - id: skill_approach
    situation: |
      Skills with context: fork provide execution isolation, which is valuable for exploration tasks. However, for a multi-file architectural refactoring, you need to see the full picture of how all 5 files interrelate before making changes. Plan mode is better suited for this because it outlines the complete approach. You could use skills for isolated subtasks afterward.
    choices:
      - text: "Use plan mode for the overall architecture, then skills for isolated subtasks if needed"
        next: plan_mode
        score: 0.5
  - id: tdd_iteration
    situation: |
      Excellent. You write a failing test for the new middleware interface, implement it, and the test passes. You repeat for the service layer, repository, and routes. Each step is verified before moving on. All tests pass and the refactoring is complete. Now you want to do a quality review of the generated code. How do you approach the review?
    choices:
      - text: "Start a new, separate Claude Code session dedicated to reviewing the code"
        next: end_proper
        score: 1.0
      - text: "Ask Claude in the current session to review the code it just wrote"
        next: end_self_review
        score: 0.3
  - id: vague_instructions
    situation: |
      "Make the authentication better" gives Claude no measurable criteria for success. What does "better" mean? More secure? Faster? More readable? Without explicit goals, Claude makes unfocused changes -- perhaps renaming variables here, adding comments there -- without addressing the actual refactoring objectives. The changes cannot be verified because there is no definition of done.
    choices:
      - text: "Provide explicit criteria and use TDD to verify each change"
        next: tdd_iteration
        score: 0.5
  - id: test_last
    situation: |
      You implement all 5 files without running any tests. When you finally run the test suite, 14 tests fail. The failures are spread across multiple files, and some are caused by earlier mistakes that were compounded by later changes. Debugging is difficult because you cannot tell which file introduced the first error. Incremental testing would have caught each issue in isolation.
    choices:
      - text: "Switch to a TDD approach: fix one component at a time with tests"
        next: tdd_iteration
        score: 0.5
  - id: end_proper
    outcome: |
      You configured team standards in the project-level CLAUDE.md (version-controlled and shared), used plan mode to map the multi-file refactoring before coding, followed TDD iteration for verifiable incremental progress, and used a separate session for an unbiased code review. This is the recommended workflow for complex code generation tasks with Claude Code.
    total_score: best
  - id: end_self_review
    outcome: |
      The review in the same session inherits Claude's prior reasoning context, creating confirmation bias. Claude is less likely to notice issues in code it just generated because its internal state still holds the justifications for each decision. A separate session approaches the code fresh, without the generator's assumptions, and is more likely to catch overlooked issues.
    total_score: partial
---
