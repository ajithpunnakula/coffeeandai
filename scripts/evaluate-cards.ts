#!/usr/bin/env npx tsx
/**
 * LLM-as-Judge card quality evaluator.
 * Scores every card in a course on clarity, accuracy, exam-alignment,
 * conciseness, and distractor quality (quiz only) using gpt-4o-mini.
 *
 * Usage:
 *   npx tsx scripts/evaluate-cards.ts courses/<slug> [--dry-run]
 *
 * Requires OPENAI_API_KEY environment variable.
 * Outputs courses/<slug>/eval-report.json with scores + per-dimension feedback.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import { parse as parseYaml } from "yaml";
import { neon } from "@neondatabase/serverless";

// ── Types ──────────────────────────────────────────────────────────────────

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
}

interface Question {
  prompt: string;
  objective: string;
  source: string;
  choices: { text: string; correct: boolean; misconception?: string; feedback?: string }[];
  wiki_ref?: string;
}

interface Step {
  id: string;
  situation?: string;
  outcome?: string;
  choices?: { text: string; next: string; score: number }[];
  total_score?: string;
}

interface DimensionScore {
  score: number;
  feedback: string;
}

interface CardEvaluation {
  card_id: string;
  file: string;
  title: string;
  type: string;
  domain: string;
  scores: {
    clarity: DimensionScore;
    accuracy: DimensionScore;
    exam_alignment: DimensionScore;
    conciseness: DimensionScore;
    distractor_quality?: DimensionScore;
  };
  flagged: boolean;
  flagged_dimensions: string[];
}

interface EvalReport {
  course_slug: string;
  evaluated_at: string;
  model: string;
  total_cards: number;
  flagged_cards: number;
  cards: CardEvaluation[];
  summary: {
    avg_clarity: number;
    avg_accuracy: number;
    avg_exam_alignment: number;
    avg_conciseness: number;
    avg_distractor_quality: number | null;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): { frontmatter: any; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return { frontmatter: parseYaml(match[1]), body: match[2] };
}

function buildCardContent(fm: CardFrontmatter, body: string): string {
  const parts: string[] = [];
  parts.push(`Title: ${fm.title}`);
  parts.push(`Type: ${fm.type}`);
  parts.push(`Domain: ${fm.domain}`);
  parts.push(`Difficulty: ${fm.difficulty}/3`);

  if (fm.type === "page") {
    parts.push(`\nCard Body:\n${body.trim()}`);
    if (fm.speaker_notes) parts.push(`\nSpeaker Notes:\n${fm.speaker_notes}`);
  }

  if (fm.type === "quiz" && fm.questions) {
    for (let i = 0; i < fm.questions.length; i++) {
      const q = fm.questions[i];
      parts.push(`\nQuestion ${i + 1}: ${q.prompt}`);
      parts.push(`Objective: ${q.objective}`);
      for (const c of q.choices) {
        const marker = c.correct ? "[CORRECT]" : "[WRONG]";
        parts.push(`  ${marker} ${c.text}`);
        if (c.misconception) parts.push(`    Misconception: ${c.misconception}`);
      }
    }
  }

  if (fm.type === "scenario" && fm.steps) {
    for (const step of fm.steps) {
      if (step.situation) {
        parts.push(`\nStep "${step.id}": ${step.situation}`);
        for (const c of step.choices ?? []) {
          parts.push(`  [score=${c.score}] ${c.text} → ${c.next}`);
        }
      }
      if (step.outcome) {
        parts.push(`\nOutcome "${step.id}": ${step.outcome} (${step.total_score})`);
      }
    }
  }

  if (fm.type === "reflection") {
    parts.push(`\nPrompt:\n${fm.prompt}`);
    if (body.trim()) parts.push(`\nBody:\n${body.trim()}`);
  }

  return parts.join("\n");
}

function buildRubricPrompt(cardContent: string, wikiContent: string, isQuiz: boolean): string {
  const dimensions = [
    `1. **clarity** (1-10): Is the card understandable in one read? Is jargon explained? Is the language precise?`,
    `2. **accuracy** (1-10): Do the card's claims match the source wiki material provided below? Flag any factual errors or unsupported claims.`,
    `3. **exam_alignment** (1-10): Does this card test or teach what a certification exam would actually test? Is the content exam-relevant?`,
    `4. **conciseness** (1-10): Is the content appropriately sized? Is there filler or unnecessary repetition?`,
  ];
  if (isQuiz) {
    dimensions.push(
      `5. **distractor_quality** (1-10): Are the wrong answers plausible? Do misconceptions map to real mistakes a learner might make? Are distractors too obvious or too tricky?`
    );
  }

  return `You are an expert instructional designer evaluating a certification training card. Score the card on each dimension below.

## Scoring Dimensions
${dimensions.join("\n")}

## Card Content
${cardContent}

## Source Wiki Material
${wikiContent}

## Instructions
Score each dimension from 1-10. Provide brief, specific feedback for each dimension explaining the score.
A score of 6+ means acceptable quality. Below 6 means the card needs improvement.

Respond with ONLY valid JSON in this exact format (no markdown fencing):
{
  "clarity": { "score": <number>, "feedback": "<string>" },
  "accuracy": { "score": <number>, "feedback": "<string>" },
  "exam_alignment": { "score": <number>, "feedback": "<string>" },
  "conciseness": { "score": <number>, "feedback": "<string>" }${isQuiz ? `,\n  "distractor_quality": { "score": <number>, "feedback": "<string>" }` : ""}
}`;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<any> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");

  // Strip markdown fencing if present
  const cleaned = content.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const publish = args.includes("--publish");
  const courseDir = args.find((a) => !a.startsWith("--"));

  if (!courseDir) {
    console.error("Usage: npx tsx scripts/evaluate-cards.ts courses/<slug> [--dry-run] [--publish]");
    process.exit(1);
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY && !dryRun) {
    console.error("Error: OPENAI_API_KEY environment variable is required (use --dry-run to skip)");
    process.exit(1);
  }

  const rootDir = join(courseDir, "../..");
  const wikiDir = join(rootDir, "wiki");
  const cardsDir = join(courseDir, "cards");
  const slug = basename(courseDir);

  if (!existsSync(join(courseDir, "course.md"))) {
    console.error(`Error: ${courseDir}/course.md not found`);
    process.exit(1);
  }

  const cardFiles = existsSync(cardsDir)
    ? readdirSync(cardsDir).filter((f) => f.endsWith(".md")).sort()
    : [];

  if (cardFiles.length === 0) {
    console.error("No card files found");
    process.exit(1);
  }

  console.log(`\nEvaluating ${cardFiles.length} cards in ${slug}...\n`);

  const evaluations: CardEvaluation[] = [];

  for (const file of cardFiles) {
    const cardPath = join(cardsDir, file);
    const cardRaw = readFileSync(cardPath, "utf-8");
    const { frontmatter: fm, body } = parseFrontmatter(cardRaw);
    const card = fm as CardFrontmatter;

    // Load wiki ref content
    const wikiParts: string[] = [];
    for (const ref of card.wiki_refs ?? []) {
      const wikiPath = join(wikiDir, `${ref}.md`);
      if (existsSync(wikiPath)) {
        wikiParts.push(`### ${ref}\n${readFileSync(wikiPath, "utf-8")}`);
      }
    }
    const wikiContent = wikiParts.length > 0
      ? wikiParts.join("\n\n")
      : "(No wiki source material available)";

    const cardContent = buildCardContent(card, body);
    const isQuiz = card.type === "quiz";

    if (dryRun) {
      console.log(`  [dry-run] ${file} (${card.type}) — would evaluate`);
      continue;
    }

    process.stdout.write(`  ${file} ... `);

    const prompt = buildRubricPrompt(cardContent, wikiContent, isQuiz);
    const scores = await callOpenAI(prompt, OPENAI_API_KEY!);

    const flaggedDimensions: string[] = [];
    for (const [dim, val] of Object.entries(scores) as [string, DimensionScore][]) {
      if (val.score < 6) flaggedDimensions.push(dim);
    }

    const evaluation: CardEvaluation = {
      card_id: card.id,
      file,
      title: card.title,
      type: card.type,
      domain: card.domain,
      scores,
      flagged: flaggedDimensions.length > 0,
      flagged_dimensions: flaggedDimensions,
    };

    evaluations.push(evaluation);

    const flag = evaluation.flagged ? " ⚠ FLAGGED" : "";
    const dimScores = Object.entries(scores)
      .map(([k, v]: [string, any]) => `${k}=${v.score}`)
      .join(", ");
    console.log(`${dimScores}${flag}`);
  }

  if (dryRun) {
    console.log(`\n[dry-run] Would evaluate ${cardFiles.length} cards. No API calls made.`);
    return;
  }

  // ── Compute summary ────────────────────────────────────────────────

  const avg = (key: string) => {
    const vals = evaluations.map((e) => (e.scores as any)[key]?.score).filter((v: any) => v != null);
    return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
  };

  const quizEvals = evaluations.filter((e) => e.scores.distractor_quality);
  const avgDistractor = quizEvals.length > 0
    ? quizEvals.reduce((s, e) => s + e.scores.distractor_quality!.score, 0) / quizEvals.length
    : null;

  const report: EvalReport = {
    course_slug: slug,
    evaluated_at: new Date().toISOString(),
    model: "gpt-4o-mini",
    total_cards: evaluations.length,
    flagged_cards: evaluations.filter((e) => e.flagged).length,
    cards: evaluations,
    summary: {
      avg_clarity: +avg("clarity").toFixed(2),
      avg_accuracy: +avg("accuracy").toFixed(2),
      avg_exam_alignment: +avg("exam_alignment").toFixed(2),
      avg_conciseness: +avg("conciseness").toFixed(2),
      avg_distractor_quality: avgDistractor !== null ? +avgDistractor.toFixed(2) : null,
    },
  };

  // ── Write report ───────────────────────────────────────────────────

  const reportPath = join(courseDir, "eval-report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`\nReport written to ${reportPath}`);

  // ── Publish LLM scores to card_quality table ───────────────────────

  if (publish) {
    if (!process.env.DATABASE_URL) {
      console.error("Error: DATABASE_URL required for --publish");
      process.exit(1);
    }
    const sql = neon(process.env.DATABASE_URL);
    let published = 0;
    for (const card of evaluations) {
      const s = card.scores;
      await sql`
        INSERT INTO content.card_quality (
          card_id, llm_clarity, llm_accuracy, llm_alignment,
          llm_conciseness, llm_distractor_quality, llm_feedback, evaluated_at
        ) VALUES (
          ${card.card_id},
          ${s.clarity.score}, ${s.accuracy.score}, ${s.exam_alignment.score},
          ${s.conciseness.score}, ${s.distractor_quality?.score ?? null},
          ${JSON.stringify(s)}::jsonb,
          now()
        )
        ON CONFLICT (card_id) DO UPDATE SET
          llm_clarity = EXCLUDED.llm_clarity,
          llm_accuracy = EXCLUDED.llm_accuracy,
          llm_alignment = EXCLUDED.llm_alignment,
          llm_conciseness = EXCLUDED.llm_conciseness,
          llm_distractor_quality = EXCLUDED.llm_distractor_quality,
          llm_feedback = EXCLUDED.llm_feedback,
          evaluated_at = EXCLUDED.evaluated_at
      `;
      published++;
    }
    console.log(`\nPublished ${published} LLM scores to content.card_quality`);
  }

  // ── Print summary table ────────────────────────────────────────────

  console.log(`\n${"═".repeat(70)}`);
  console.log("EVALUATION SUMMARY");
  console.log("═".repeat(70));
  console.log(`  Course:           ${slug}`);
  console.log(`  Model:            gpt-4o-mini`);
  console.log(`  Cards evaluated:  ${report.total_cards}`);
  console.log(`  Cards flagged:    ${report.flagged_cards}`);
  console.log(`  Avg clarity:      ${report.summary.avg_clarity}`);
  console.log(`  Avg accuracy:     ${report.summary.avg_accuracy}`);
  console.log(`  Avg exam-align:   ${report.summary.avg_exam_alignment}`);
  console.log(`  Avg conciseness:  ${report.summary.avg_conciseness}`);
  if (report.summary.avg_distractor_quality !== null) {
    console.log(`  Avg distractors:  ${report.summary.avg_distractor_quality} (quiz cards only)`);
  }
  console.log("═".repeat(70));

  if (report.flagged_cards > 0) {
    console.log("\nFLAGGED CARDS (score < 6 on any dimension):");
    for (const card of evaluations.filter((e) => e.flagged)) {
      console.log(`\n  ${card.file} — ${card.title}`);
      for (const dim of card.flagged_dimensions) {
        const s = (card.scores as any)[dim];
        console.log(`    ${dim}: ${s.score}/10 — ${s.feedback}`);
      }
    }
    console.log("");
  }

  console.log("═".repeat(70));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
