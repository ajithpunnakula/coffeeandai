#!/usr/bin/env npx tsx
/**
 * Auto-regenerate cards that scored below threshold in eval-report.json.
 *
 * For each flagged card:
 * 1. Read the card + its LLM feedback from eval-report.json
 * 2. Read source wiki pages
 * 3. Send to LLM: "Rewrite this card addressing these issues"
 * 4. Overwrite the card file (preserving id, order, domain, wiki_refs)
 * 5. Re-run validate-course.ts on each rewrite
 *
 * Usage:
 *   npx tsx scripts/regenerate-weak-cards.ts courses/<slug> [--dry-run] [--threshold N]
 *
 * Requires OPENAI_API_KEY environment variable.
 * Max 2 regeneration attempts per card. If still failing, flags for human review.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import { parse as parseYaml } from "yaml";
import { createHash } from "crypto";
import { execSync } from "child_process";

// ── Types ──────────────────────────────────────────────────────────────────

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
  cards: CardEvaluation[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): { frontmatter: any; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return { frontmatter: parseYaml(match[1]), body: match[2] };
}

function md5First8(text: string): string {
  return createHash("md5").update(text).digest("hex").slice(0, 8);
}

function buildFeedbackSummary(scores: CardEvaluation["scores"]): string {
  const lines: string[] = [];
  for (const [dim, val] of Object.entries(scores) as [string, DimensionScore][]) {
    if (val && val.score < 6) {
      lines.push(`- ${dim} (${val.score}/10): ${val.feedback}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : "(No specific issues flagged)";
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

function buildRegenPrompt(
  cardType: string,
  existingCard: string,
  wikiContent: string,
  feedbackSummary: string,
  preservedFields: { id: string; order: number; domain: string; wiki_refs: string[]; source?: string },
): string {
  const schemaGuide: Record<string, string> = {
    page: `Page card requirements:
- YAML frontmatter with: id, type: page, order, difficulty (1-3), title, domain, wiki_refs, source, content_hashes, speaker_notes
- content_hashes: for each wiki_ref, include the key with an 8-char hash value
- speaker_notes: narration script for TTS
- Body content in markdown, >100 chars, should teach not just summarize`,

    quiz: `Quiz card requirements:
- YAML frontmatter with: id, type: quiz, order, difficulty (1-3), title, domain, wiki_refs, pass_threshold (0.8)
- questions array with: prompt, objective, source, choices (4+ each)
- Exactly 1 correct choice per question
- Every wrong choice MUST have a misconception field (specific, not generic)
- Distractors must be plausible and test real misconceptions
- No body content after frontmatter (quiz is entirely in frontmatter)`,

    scenario: `Scenario card requirements:
- YAML frontmatter with: id, type: scenario, order, difficulty (usually 3), title, domain, wiki_refs, source
- steps array with: id, situation, choices (text, next, score) or outcome/total_score for terminal steps
- Minimum 3 steps before any outcome
- At least one "bad path" with feedback
- Start step must have id: "start"`,

    reflection: `Reflection card requirements:
- YAML frontmatter with: id, type: reflection, order, difficulty (1-3), title, domain, wiki_refs
- prompt field with open-ended reflection prompt
- Should prompt genuine introspection`,
  };

  return `You are an expert instructional designer. Rewrite this certification training card to address the quality issues identified below.

## Issues to Fix
${feedbackSummary}

## Card Type Schema
${schemaGuide[cardType] ?? schemaGuide.page}

## Existing Card (to rewrite)
${existingCard}

## Source Wiki Material
${wikiContent}

## Fields to Preserve (DO NOT CHANGE)
- id: ${preservedFields.id}
- order: ${preservedFields.order}
- domain: "${preservedFields.domain}"
- wiki_refs: ${JSON.stringify(preservedFields.wiki_refs)}
${preservedFields.source ? `- source: "${preservedFields.source}"` : ""}

## Instructions
Rewrite the entire card (frontmatter + body) addressing every issue listed above. Output ONLY the complete card file content (starting with --- for frontmatter). Preserve the exact id, order, domain, wiki_refs, and source fields. Improve everything else.`;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const thresholdIdx = args.indexOf("--threshold");
  const threshold = thresholdIdx >= 0 ? parseInt(args[thresholdIdx + 1], 10) : 6;
  const courseDir = args.find((a) => !a.startsWith("--"));

  if (!courseDir) {
    console.error("Usage: npx tsx scripts/regenerate-weak-cards.ts courses/<slug> [--dry-run] [--threshold N]");
    process.exit(1);
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY && !dryRun) {
    console.error("Error: OPENAI_API_KEY environment variable is required (use --dry-run to skip)");
    process.exit(1);
  }

  const rootDir = join(courseDir, "../..");
  const wikiDir = join(rootDir, "wiki");
  const slug = basename(courseDir);

  // Read eval report
  const reportPath = join(courseDir, "eval-report.json");
  if (!existsSync(reportPath)) {
    console.error(`Error: ${reportPath} not found. Run evaluate-cards.ts first.`);
    process.exit(1);
  }

  const report: EvalReport = JSON.parse(readFileSync(reportPath, "utf-8"));

  // Find cards with any dimension below threshold
  const weakCards = report.cards.filter((card) => {
    return Object.values(card.scores).some(
      (dim: DimensionScore) => dim && dim.score < threshold
    );
  });

  if (weakCards.length === 0) {
    console.log(`\nNo cards scoring below ${threshold} on any dimension. Nothing to regenerate.`);
    return;
  }

  console.log(`\nFound ${weakCards.length} weak cards (threshold: ${threshold}) in ${slug}\n`);

  const MAX_ATTEMPTS = 2;
  let regenerated = 0;
  let stillFailing: string[] = [];

  for (const evalCard of weakCards) {
    const cardPath = join(courseDir, "cards", evalCard.file);
    if (!existsSync(cardPath)) {
      console.log(`  ${evalCard.file} — file not found, skipping`);
      continue;
    }

    const feedbackSummary = buildFeedbackSummary(evalCard.scores);
    console.log(`  ${evalCard.file} — ${evalCard.title}`);
    console.log(`    Issues: ${evalCard.flagged_dimensions.join(", ")}`);

    if (dryRun) {
      console.log(`    [dry-run] Would regenerate`);
      continue;
    }

    let success = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`    Attempt ${attempt}/${MAX_ATTEMPTS}...`);

      // Read current card content
      const cardRaw = readFileSync(cardPath, "utf-8");
      const { frontmatter: fm } = parseFrontmatter(cardRaw);

      // Load wiki refs
      const wikiParts: string[] = [];
      for (const ref of fm.wiki_refs ?? []) {
        const wikiPath = join(wikiDir, `${ref}.md`);
        if (existsSync(wikiPath)) {
          wikiParts.push(`### ${ref}\n${readFileSync(wikiPath, "utf-8")}`);
        }
      }
      const wikiContent = wikiParts.length > 0
        ? wikiParts.join("\n\n")
        : "(No wiki source material available)";

      // Build regen prompt
      const prompt = buildRegenPrompt(
        fm.type,
        cardRaw,
        wikiContent,
        feedbackSummary,
        {
          id: fm.id,
          order: fm.order,
          domain: fm.domain,
          wiki_refs: fm.wiki_refs ?? [],
          source: fm.source,
        },
      );

      const rewritten = await callOpenAI(prompt, OPENAI_API_KEY!);

      // Strip any markdown fencing the model may wrap around the output
      const cleaned = rewritten.replace(/^```(?:yaml|markdown|md)?\n/, "").replace(/\n```$/, "");

      // Update content_hashes for page cards
      let finalContent = cleaned;
      if (fm.type === "page") {
        const { frontmatter: newFm } = parseFrontmatter(cleaned);
        if (newFm.content_hashes) {
          for (const ref of fm.wiki_refs ?? []) {
            const wikiPath = join(wikiDir, `${ref}.md`);
            if (existsSync(wikiPath)) {
              newFm.content_hashes[ref] = md5First8(readFileSync(wikiPath, "utf-8"));
            }
          }
        }
      }

      writeFileSync(cardPath, finalContent + "\n");
      console.log(`    Card rewritten`);

      // Run validator
      try {
        execSync(`npx tsx scripts/validate-course.ts ${courseDir}`, {
          cwd: rootDir,
          stdio: "pipe",
          timeout: 30000,
        });
        console.log(`    Validation passed`);
        success = true;
        regenerated++;
        break;
      } catch (err: any) {
        const output = err.stdout?.toString() ?? "";
        const failCount = output.match(/(\d+) failed/)?.[1] ?? "?";
        console.log(`    Validation failed (${failCount} failures), ${attempt < MAX_ATTEMPTS ? "retrying..." : "giving up"}`);
      }
    }

    if (!success) {
      stillFailing.push(evalCard.file);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────

  console.log(`\n${"═".repeat(60)}`);
  console.log("REGENERATION SUMMARY");
  console.log("═".repeat(60));
  console.log(`  Course:           ${slug}`);
  console.log(`  Weak cards found: ${weakCards.length}`);
  console.log(`  Regenerated:      ${regenerated}`);
  console.log(`  Still failing:    ${stillFailing.length}`);
  if (stillFailing.length > 0) {
    console.log(`\n  Cards requiring human review:`);
    for (const f of stillFailing) {
      console.log(`    - ${f}`);
    }
  }
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
