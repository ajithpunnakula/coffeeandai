---
name: generate-course
description: Generate a card-based certification training course from wiki content
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generate Course

Generate a complete card-based course from the wiki knowledge base.

## Usage

`/generate-course <topic-or-slug>`

Example: `/generate-course claude-architect`

## Workflow

### 1. Gather source material

1. Read `wiki/index.md` to locate pages relevant to `$ARGUMENTS`.
2. For each relevant page, read it and follow `[[wikilinks]]` one hop out for context.
3. Read exam guide / domain structure source material from `raw/` if this is exam-prep content.
4. Identify the domains, their weights, and the key concepts per domain.

### 2. Generate concept prerequisite graph

Create `courses/<slug>/graph.yaml` following this format:

```yaml
concepts:
  concept-key:
    prerequisites: [other-concept-key]
    domain: "Domain Name"
    wiki_page: "Wiki Page Title"
```

Rules:
- Every concept maps to a wiki page.
- Prerequisites define a DAG (no cycles).
- Every domain from the course must have concepts.

### 3. Generate course manifest

Create `courses/<slug>/course.md` with YAML frontmatter:

```yaml
---
type: course
id: "course_<slug>"
title: "Course Title"
status: draft
exam_target: "target-exam-slug"
target_audience: "Who this is for"
estimated_minutes: 90
pass_threshold: 0.72
difficulty_curve: gradual
domains:
  - name: "Domain Name"
    weight: 0.25
    cards: [03, 04, 05]
card_order:
  - cards/01-slug.md
  - cards/02-slug.md
tags: [tag1, tag2]
---
```

The body should contain objectives, exam format, and overview.

### 4. Generate cards

Create individual card files in `courses/<slug>/cards/` following these schemas.

**Card ID format:** `card_<8-char-hex>` — generate randomly, must be unique across the course.

**Filename convention:** `NN-slug.md` where NN is zero-padded order number.

#### Card mix targets
- **Page cards:** 40-60% of total
- **Quiz cards:** 15-30%
- **Scenario cards:** 10-20%
- **Reflection cards:** 5-15%
- **Interactive card every 2-3 pages** (no more than 3 consecutive page cards)

#### Difficulty curve
- First third: difficulty 1 (recall)
- Middle third: difficulty 2 (application)
- Last third: difficulty 3 (analysis)

#### Page card schema
```yaml
---
id: "card_<8hex>"
type: page
order: N
difficulty: 1-3
title: "Title"
domain: "Domain Name"
wiki_refs: ["Wiki Page 1", "Wiki Page 2"]
source: "raw/filename.md"
content_hashes:
  "Wiki Page 1": "<first-8-chars-of-md5>"
speaker_notes: |
  Narration script for TTS...
---

Body content in markdown, >100 chars...
```

For `content_hashes`: read each wiki_ref page, compute a simple hash of its content (first 8 chars of a hex digest). This enables staleness detection.

#### Quiz card schema
```yaml
---
id: "card_<8hex>"
type: quiz
order: N
difficulty: 1-3
title: "Title"
domain: "Domain Name"
wiki_refs: ["Wiki Page"]
pass_threshold: 0.8
questions:
  - prompt: "Question text"
    objective: "What this tests"
    source: "raw/filename.md"
    choices:
      - text: "Answer A"
        correct: true
        feedback: "Why correct"
      - text: "Answer B"
        correct: false
        misconception: "what the learner confused"
        feedback: "Why wrong and what's right"
      - text: "Answer C"
        correct: false
        misconception: "specific misconception"
        feedback: "Correction"
      - text: "Answer D"
        correct: false
        misconception: "specific misconception"
        feedback: "Correction"
---
```

**ENFORCED quiz constraints:**
- Every wrong choice MUST have a `misconception` field (non-empty, specific)
- Every question MUST have a `source` field pointing to an existing `raw/` file
- Every question MUST have an `objective`
- At least 4 choices per question
- Exactly 1 correct choice per question
- Where a relevant anti-pattern exists, at least one distractor should reference it
- **Quizzes must be hard enough to fail on first attempt**

#### Scenario card schema
```yaml
---
id: "card_<8hex>"
type: scenario
order: N
difficulty: 3
title: "Title"
domain: "Domain Name"
wiki_refs: ["Wiki Page"]
source: "raw/filename.md"
steps:
  - id: start
    situation: |
      Description of the situation...
    choices:
      - text: "Option A"
        next: step_id
        score: 1.0
      - text: "Option B"
        next: other_step
        score: 0.0
  - id: terminal_step
    outcome: |
      What happened as a result...
    total_score: best|partial|poor
---
```

**Scenario constraints:**
- Minimum 3 steps before reaching any outcome
- At least one "bad path" that loops back or dead-ends with feedback
- Scoring based on path taken
- If generating from exam scenarios source material, each of the 6 scenarios should become its own multi-step card

#### Reflection card schema
```yaml
---
id: "card_<8hex>"
type: reflection
order: N
difficulty: 1-3
title: "Title"
domain: "Domain Name"
wiki_refs: ["Wiki Page"]
prompt: |
  Open-ended reflection prompt...
---
```

### 5. Update wiki

1. Add a "Courses" section to `wiki/index.md` if not present.
2. Add an entry: `- [[Course - <Title>]] — one-line summary`
3. Append to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] generate-course | <Title>
   Generated N cards across M domains. Card mix: X page, Y quiz, Z scenario, W reflection.
   ```

### 6. Validate

Run the validator:
```bash
npx tsx scripts/validate-course.ts courses/<slug>
```

**Fix any failures before completing.** Iterate until the validator exits 0 with all checks passing.

## Quality gates

Every card should be something a learner would genuinely learn from:
- Page cards should teach, not just summarize
- Quiz distractors should be plausible and test real misconceptions
- Scenarios should feel like real-world decisions
- Reflections should prompt genuine introspection
