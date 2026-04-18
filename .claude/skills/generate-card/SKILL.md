---
name: generate-card
description: Regenerate a single card within an existing course
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generate Card

Regenerate a single card within an existing course.

## Usage

`/generate-card <course-slug> <card-filename>`

Example: `/generate-card claude-architect 05-quiz-agentic.md`

## Workflow

1. Read the existing card at `courses/<course-slug>/cards/<card-filename>`.
2. Read `courses/<course-slug>/course.md` for domain context.
3. Read `courses/<course-slug>/graph.yaml` for prerequisite context.
4. Read the wiki pages referenced in the card's `wiki_refs`.
5. Read the source material referenced in the card's `source` field.
6. **Preserve the card's existing `id` field** — do not change it.
7. Regenerate the card content following all schemas and constraints from the `/generate-course` skill.
8. Update `content_hashes` to reflect current wiki page content.
9. Run the validator:
   ```bash
   npx tsx scripts/validate-course.ts courses/<course-slug>
   ```
10. Fix any failures before completing.
