#!/usr/bin/env npx tsx
/**
 * Course content validator.
 * Usage: npx tsx scripts/validate-course.ts courses/<slug>
 * Exit 0 = all checks pass, exit 1 = failures found.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import { parse as parseYaml } from "yaml";

// ── Types ──────────────────────────────────────────────────────────────────

interface CourseManifest {
  type: string;
  id: string;
  title: string;
  status: string;
  exam_target: string;
  target_audience: string;
  estimated_minutes: number;
  pass_threshold: number;
  difficulty_curve: string;
  domains: { name: string; weight: number; cards: number[] }[];
  card_order: string[];
  tags: string[];
}

interface CardFrontmatter {
  id: string;
  type: "page" | "quiz" | "scenario" | "reflection";
  order: number;
  difficulty: number;
  title: string;
  domain: string;
  wiki_refs?: string[];
  source?: string;
  speaker_notes?: string;
  content_hashes?: Record<string, string>;
  pass_threshold?: number;
  questions?: Question[];
  steps?: Step[];
  prompt?: string;
  image?: string;
  audio?: string;
}

interface Question {
  prompt: string;
  objective: string;
  source: string;
  choices: Choice[];
  wiki_ref?: string;
}

interface Choice {
  text: string;
  correct: boolean;
  misconception?: string;
  feedback?: string;
}

interface Step {
  id: string;
  situation?: string;
  outcome?: string;
  choices?: StepChoice[];
  total_score?: string;
}

interface StepChoice {
  text: string;
  next: string;
  score: number;
}

interface GraphConcept {
  prerequisites: string[];
  domain: string;
  wiki_page?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PASS = "✓";
const FAIL = "✗";

let passes = 0;
let failures = 0;
const failDetails: string[] = [];

function check(ok: boolean, label: string, detail?: string): boolean {
  if (ok) {
    passes++;
    console.log(`  ${PASS} ${label}`);
  } else {
    failures++;
    const msg = detail ? `${label}: ${detail}` : label;
    console.log(`  ${FAIL} ${msg}`);
    failDetails.push(msg);
  }
  return ok;
}

function parseFrontmatter(content: string): { frontmatter: any; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return { frontmatter: parseYaml(match[1]), body: match[2] };
}

function readMarkdown(path: string): { frontmatter: any; body: string } {
  const content = readFileSync(path, "utf-8");
  return parseFrontmatter(content);
}

// ── Main ───────────────────────────────────────────────────────────────────

const courseDir = process.argv[2];
if (!courseDir) {
  console.error("Usage: npx tsx scripts/validate-course.ts courses/<slug>");
  process.exit(1);
}

const rootDir = join(courseDir, "../..");
const courseMdPath = join(courseDir, "course.md");
const graphPath = join(courseDir, "graph.yaml");
const cardsDir = join(courseDir, "cards");

// ════════════════════════════════════════════════════════════════════════════
// STRUCTURE CHECKS
// ════════════════════════════════════════════════════════════════════════════

console.log("\nSTRUCTURE CHECKS:");

const courseExists = check(existsSync(courseMdPath), "course.md exists");
if (!courseExists) {
  console.log("\nCannot continue without course.md");
  process.exit(1);
}

const { frontmatter: courseFm } = readMarkdown(courseMdPath);
const manifest = courseFm as CourseManifest;

const requiredCourseFields = [
  "id",
  "title",
  "exam_target",
  "domains",
  "card_order",
  "pass_threshold",
];
for (const field of requiredCourseFields) {
  check(
    manifest[field as keyof CourseManifest] != null,
    `course.md has required field: ${field}`
  );
}

const graphExists = check(existsSync(graphPath), "graph.yaml exists");
let graph: Record<string, GraphConcept> = {};
if (graphExists) {
  const graphContent = readFileSync(graphPath, "utf-8");
  const parsed = parseYaml(graphContent);
  graph = parsed?.concepts ?? {};

  // Check for cycles via topological sort
  const visited = new Set<string>();
  const visiting = new Set<string>();
  let hasCycle = false;
  function dfs(node: string) {
    if (visiting.has(node)) {
      hasCycle = true;
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const prereq of graph[node]?.prerequisites ?? []) {
      if (graph[prereq]) dfs(prereq);
    }
    visiting.delete(node);
    visited.add(node);
  }
  for (const concept of Object.keys(graph)) dfs(concept);
  check(!hasCycle, "graph.yaml has no cycles");
}

// Card files
const cardFiles = existsSync(cardsDir)
  ? readdirSync(cardsDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
  : [];

const cardOrder = manifest.card_order ?? [];

for (const entry of cardOrder) {
  const filePath = join(courseDir, entry);
  check(existsSync(filePath), `card_order entry exists on disk: ${entry}`);
}

const cardOrderBasenames = new Set(cardOrder.map((e) => basename(e)));
for (const file of cardFiles) {
  check(
    cardOrderBasenames.has(file),
    `Card file listed in card_order (no orphans): ${file}`
  );
}

// Filename convention: NN-slug.md
for (const file of cardFiles) {
  check(
    /^\d{2}-[a-z0-9-]+\.md$/.test(file),
    `Card filename matches NN-slug.md convention: ${file}`
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD SCHEMA CHECKS
// ════════════════════════════════════════════════════════════════════════════

console.log("\nCARD SCHEMA CHECKS:");

const domainNames = new Set(
  (manifest.domains ?? []).map((d) => d.name)
);
const allCards: { fm: CardFrontmatter; body: string; file: string }[] = [];
const cardIds = new Set<string>();

for (const file of cardFiles) {
  const filePath = join(cardsDir, file);
  const { frontmatter: fm, body } = readMarkdown(filePath);
  allCards.push({ fm, body, file });

  // Common checks
  const idValid =
    typeof fm.id === "string" && /^card_[0-9a-f]{8}$/.test(fm.id);
  check(idValid, `[${file}] Has valid id (card_<8hex>)`, fm.id);
  if (idValid) {
    check(!cardIds.has(fm.id), `[${file}] id is unique`, fm.id);
    cardIds.add(fm.id);
  }

  check(
    ["page", "quiz", "scenario", "reflection"].includes(fm.type),
    `[${file}] Has valid type`,
    fm.type
  );
  check(typeof fm.order === "number", `[${file}] Has order`);
  check(
    typeof fm.difficulty === "number" &&
      fm.difficulty >= 1 &&
      fm.difficulty <= 3,
    `[${file}] Has difficulty 1-3`,
    String(fm.difficulty)
  );
  check(typeof fm.title === "string" && fm.title.length > 0, `[${file}] Has title`);
  check(domainNames.has(fm.domain), `[${file}] domain matches course.md`, fm.domain);
  check(
    Array.isArray(fm.wiki_refs) && fm.wiki_refs.length > 0,
    `[${file}] wiki_refs is present and non-empty`
  );

  // Type-specific checks
  if (fm.type === "page") {
    check(
      typeof fm.speaker_notes === "string" && fm.speaker_notes.trim().length > 0,
      `[${file}] Page has speaker_notes`
    );
    check(
      fm.content_hashes != null && Object.keys(fm.content_hashes).length > 0,
      `[${file}] Page has content_hashes`
    );
    check(body.trim().length > 100, `[${file}] Page body >100 chars`, `${body.trim().length} chars`);
  }

  if (fm.type === "quiz") {
    const questions = fm.questions ?? [];
    check(questions.length >= 1, `[${file}] Quiz has ≥1 question`);
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const qLabel = `[${file}] Q${qi + 1}`;
      check(typeof q.prompt === "string", `${qLabel} has prompt`);
      check(typeof q.objective === "string", `${qLabel} has objective`);
      check(typeof q.source === "string", `${qLabel} has source`);
      if (typeof q.source === "string") {
        check(
          existsSync(join(rootDir, q.source)),
          `${qLabel} source file exists`,
          q.source
        );
      }
      const choices = q.choices ?? [];
      check(choices.length >= 4, `${qLabel} has ≥4 choices`, String(choices.length));
      const correctCount = choices.filter((c) => c.correct).length;
      check(correctCount === 1, `${qLabel} has exactly 1 correct choice`, String(correctCount));
      for (let ci = 0; ci < choices.length; ci++) {
        if (!choices[ci].correct) {
          check(
            typeof choices[ci].misconception === "string" &&
              choices[ci].misconception!.length > 0,
            `${qLabel} choice ${ci + 1} (incorrect) has misconception`
          );
        }
      }
    }
    check(
      typeof fm.pass_threshold === "number" &&
        fm.pass_threshold >= 0 &&
        fm.pass_threshold <= 1,
      `[${file}] Quiz has valid pass_threshold`
    );
  }

  if (fm.type === "scenario") {
    const steps = fm.steps ?? [];
    check(steps.length >= 3, `[${file}] Scenario has ≥3 steps`, String(steps.length));

    const stepIds = new Set(steps.map((s) => s.id));
    const allStepIdsUnique = stepIds.size === steps.length;
    check(allStepIdsUnique, `[${file}] All step ids are unique`);

    let hasTerminal = false;
    const reachable = new Set<string>();
    reachable.add("start");

    for (const step of steps) {
      check(
        typeof step.id === "string",
        `[${file}] Step has id`,
        step.id
      );
      if (step.outcome) {
        hasTerminal = true;
        // Terminal step: has outcome, no choices needed
      } else {
        check(
          typeof step.situation === "string",
          `[${file}] Step ${step.id} has situation`
        );
        check(
          Array.isArray(step.choices) && step.choices.length > 0,
          `[${file}] Step ${step.id} has choices`
        );
        for (const c of step.choices ?? []) {
          check(typeof c.text === "string", `[${file}] Step ${step.id} choice has text`);
          check(
            stepIds.has(c.next),
            `[${file}] Step ${step.id} choice next points to valid step`,
            c.next
          );
          check(typeof c.score === "number", `[${file}] Step ${step.id} choice has score`);
          reachable.add(c.next);
        }
      }
    }
    check(hasTerminal, `[${file}] Scenario has at least one terminal step`);

    // Check reachability: every non-start step should be reachable
    for (const step of steps) {
      if (step.id !== "start") {
        check(
          reachable.has(step.id),
          `[${file}] Step ${step.id} is reachable`
        );
      }
    }

    check(
      typeof fm.source === "string",
      `[${file}] Scenario has source field`
    );
  }

  if (fm.type === "reflection") {
    check(
      typeof fm.prompt === "string" && fm.prompt.trim().length > 0,
      `[${file}] Reflection has prompt`
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PEDAGOGICAL CHECKS
// ════════════════════════════════════════════════════════════════════════════

console.log("\nPEDAGOGICAL CHECKS:");

if (allCards.length > 0) {
  // Difficulty curve
  const third = Math.ceil(allCards.length / 3);
  const firstThird = allCards.slice(0, third);
  const middleThird = allCards.slice(third, third * 2);
  const lastThird = allCards.slice(third * 2);

  const avg = (cards: typeof allCards) =>
    cards.reduce((s, c) => s + (c.fm.difficulty || 1), 0) / cards.length;

  const avgFirst = avg(firstThird);
  const avgMiddle = avg(middleThird);
  const avgLast = avg(lastThird);

  check(
    avgFirst <= avgMiddle && avgMiddle <= avgLast,
    `Difficulty curve: first (${avgFirst.toFixed(2)}) ≤ middle (${avgMiddle.toFixed(2)}) ≤ last (${avgLast.toFixed(2)})`
  );

  // Card mix
  const total = allCards.length;
  const counts: Record<string, number> = { page: 0, quiz: 0, scenario: 0, reflection: 0 };
  for (const c of allCards) counts[c.fm.type] = (counts[c.fm.type] || 0) + 1;

  const pct = (type: string) => counts[type] / total;
  check(
    pct("page") >= 0.4 && pct("page") <= 0.6,
    `Card mix: page ${(pct("page") * 100).toFixed(0)}% (target 40-60%)`
  );
  check(
    pct("quiz") >= 0.15 && pct("quiz") <= 0.3,
    `Card mix: quiz ${(pct("quiz") * 100).toFixed(0)}% (target 15-30%)`
  );
  check(
    pct("scenario") >= 0.1 && pct("scenario") <= 0.2,
    `Card mix: scenario ${(pct("scenario") * 100).toFixed(0)}% (target 10-20%)`
  );
  check(
    pct("reflection") >= 0.05 && pct("reflection") <= 0.15,
    `Card mix: reflection ${(pct("reflection") * 100).toFixed(0)}% (target 5-15%)`
  );

  // No more than 3 consecutive page cards without interactive
  let consecutivePages = 0;
  let maxConsecutivePages = 0;
  for (const c of allCards) {
    if (c.fm.type === "page") {
      consecutivePages++;
      maxConsecutivePages = Math.max(maxConsecutivePages, consecutivePages);
    } else {
      consecutivePages = 0;
    }
  }
  check(
    maxConsecutivePages <= 3,
    `No more than 3 consecutive page cards`,
    `max=${maxConsecutivePages}`
  );

  // All 5 domains have at least 2 cards each
  const domainCardCounts: Record<string, number> = {};
  for (const c of allCards) {
    domainCardCounts[c.fm.domain] = (domainCardCounts[c.fm.domain] || 0) + 1;
  }
  for (const d of manifest.domains ?? []) {
    check(
      (domainCardCounts[d.name] || 0) >= 2,
      `Domain "${d.name}" has ≥2 cards`,
      String(domainCardCounts[d.name] || 0)
    );
  }

  // Domain weight roughly matches card distribution (±10%)
  for (const d of manifest.domains ?? []) {
    const actual = (domainCardCounts[d.name] || 0) / total;
    const expected = d.weight;
    check(
      Math.abs(actual - expected) <= 0.1,
      `Domain "${d.name}" weight match: actual ${(actual * 100).toFixed(0)}% vs expected ${(expected * 100).toFixed(0)}% (±10%)`,
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GRAPH CHECKS
// ════════════════════════════════════════════════════════════════════════════

console.log("\nGRAPH CHECKS:");

if (Object.keys(graph).length > 0) {
  // Every concept referenced by at least one card's wiki_refs
  const allWikiRefs = new Set<string>();
  for (const c of allCards) {
    for (const ref of c.fm.wiki_refs ?? []) {
      allWikiRefs.add(ref);
    }
  }
  for (const [concept, data] of Object.entries(graph)) {
    const wikiPage = data.wiki_page ?? concept;
    check(
      allWikiRefs.has(wikiPage) || allWikiRefs.has(concept),
      `Graph concept "${concept}" referenced by at least one card`
    );
  }

  // Every concept has a domain
  for (const [concept, data] of Object.entries(graph)) {
    check(
      typeof data.domain === "string" && data.domain.length > 0,
      `Graph concept "${concept}" has domain`
    );
  }

  // Card ordering respects prerequisites
  // Build concept → first card order map
  const conceptFirstOrder: Record<string, number> = {};
  for (const c of allCards) {
    for (const ref of c.fm.wiki_refs ?? []) {
      // Match concept by wiki_page or concept key
      for (const [key, data] of Object.entries(graph)) {
        const wikiPage = data.wiki_page ?? key;
        if (ref === wikiPage || ref === key) {
          if (!(key in conceptFirstOrder) || c.fm.order < conceptFirstOrder[key]) {
            conceptFirstOrder[key] = c.fm.order;
          }
        }
      }
    }
  }

  for (const [concept, data] of Object.entries(graph)) {
    for (const prereq of data.prerequisites) {
      if (prereq in conceptFirstOrder && concept in conceptFirstOrder) {
        check(
          conceptFirstOrder[prereq] <= conceptFirstOrder[concept],
          `Prerequisite ordering: "${prereq}" (order ${conceptFirstOrder[prereq]}) before "${concept}" (order ${conceptFirstOrder[concept]})`
        );
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CROSS-REFERENCE CHECKS
// ════════════════════════════════════════════════════════════════════════════

console.log("\nCROSS-REFERENCE CHECKS:");

const wikiDir = join(rootDir, "wiki");
for (const c of allCards) {
  for (const ref of c.fm.wiki_refs ?? []) {
    const wikiPath = join(wikiDir, `${ref}.md`);
    check(
      existsSync(wikiPath),
      `[${c.file}] wiki_ref "${ref}" exists as wiki page`
    );
  }

  if (c.fm.source) {
    check(
      existsSync(join(rootDir, c.fm.source)),
      `[${c.file}] source file exists: ${c.fm.source}`
    );
  }

  if (c.fm.type === "page" && c.fm.content_hashes) {
    const hashKeys = new Set(Object.keys(c.fm.content_hashes));
    for (const ref of c.fm.wiki_refs ?? []) {
      check(
        hashKeys.has(ref),
        `[${c.file}] content_hashes key matches wiki_ref: ${ref}`
      );
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════

console.log("\n" + "═".repeat(60));
console.log(`RESULTS: ${passes} passed, ${failures} failed`);
if (failures > 0) {
  console.log("\nFailed checks:");
  for (const d of failDetails) {
    console.log(`  ${FAIL} ${d}`);
  }
}
console.log("═".repeat(60));

process.exit(failures > 0 ? 1 : 0);
