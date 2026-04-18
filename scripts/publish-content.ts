#!/usr/bin/env npx tsx
/**
 * Publish course content to Neon PostgreSQL.
 *
 * Reads course files from disk, hashes content, and upserts only changed rows.
 * Idempotent — running twice produces the same result.
 *
 * Usage:
 *   npx tsx scripts/publish-content.ts [courses/<slug>] [--dry-run]
 *
 * If no slug is provided, discovers all course dirs under courses/.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename, resolve } from "path";
import { parse as parseYaml } from "yaml";
import { createHash } from "crypto";
import { execSync } from "child_process";
import { neon } from "@neondatabase/serverless";

// ── Types ──────────────────────────────────────────────────────────────────

interface CourseFrontmatter {
  id: string;
  type: string;
  title: string;
  status: string;
  exam_target: string;
  target_audience: string;
  estimated_minutes: number;
  pass_threshold: number;
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
  questions?: unknown[];
  steps?: unknown[];
  prompt?: string;
  image?: string;
  audio?: string;
}

interface GraphConcept {
  prerequisites: string[];
  domain: string;
  wiki_page?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function md5(content: string): string {
  return createHash("md5").update(content, "utf-8").digest("hex");
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return { frontmatter: parseYaml(match[1]), body: match[2] };
}

function getGitCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

function discoverCourseDirs(rootDir: string): string[] {
  const coursesDir = join(rootDir, "courses");
  if (!existsSync(coursesDir)) return [];
  return readdirSync(coursesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(coursesDir, d.name, "course.md")))
    .map((d) => join(coursesDir, d.name));
}

/**
 * Build type-specific metadata JSONB from card frontmatter.
 * Extracts questions (quiz), steps (scenario), prompt (reflection),
 * and common optional fields like speaker_notes and pass_threshold.
 */
function buildCardMetadata(fm: CardFrontmatter): Record<string, unknown> {
  const meta: Record<string, unknown> = {};

  if (fm.type === "quiz") {
    if (fm.questions) meta.questions = fm.questions;
    if (fm.pass_threshold != null) meta.pass_threshold = fm.pass_threshold;
  }

  if (fm.type === "scenario") {
    if (fm.steps) meta.steps = fm.steps;
  }

  if (fm.type === "reflection") {
    if (fm.prompt) meta.prompt = fm.prompt;
  }

  if (fm.speaker_notes) meta.speaker_notes = fm.speaker_notes;

  return meta;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slugArg = args.find((a) => !a.startsWith("--"));

  const rootDir = resolve(join(__dirname, ".."));
  const gitCommit = getGitCommit();

  // Discover courses
  let courseDirs: string[];
  if (slugArg) {
    const dir = resolve(slugArg);
    if (!existsSync(join(dir, "course.md"))) {
      console.error(`Error: ${dir}/course.md not found`);
      process.exit(1);
    }
    courseDirs = [dir];
  } else {
    courseDirs = discoverCourseDirs(rootDir);
    if (courseDirs.length === 0) {
      console.error("No course directories found under courses/");
      process.exit(1);
    }
  }

  // Database connection (skip in dry-run if no DATABASE_URL)
  let sql: ReturnType<typeof neon> | null = null;
  if (!dryRun) {
    if (!process.env.DATABASE_URL) {
      console.error("Error: DATABASE_URL environment variable is required (use --dry-run to skip)");
      process.exit(1);
    }
    sql = neon(process.env.DATABASE_URL);
  } else if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
  }

  let totalCourses = 0;
  let totalCardsUpserted = 0;
  let totalCardsSkipped = 0;
  let totalGraphConcepts = 0;

  for (const courseDir of courseDirs) {
    const slug = basename(courseDir);
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Processing course: ${slug}`);
    console.log("=".repeat(60));

    // ── 1. Read and parse course.md ──────────────────────────────────

    const courseMdPath = join(courseDir, "course.md");
    const courseRaw = readFileSync(courseMdPath, "utf-8");
    const { frontmatter: courseFmRaw } = parseFrontmatter(courseRaw);
    const courseFm = courseFmRaw as unknown as CourseFrontmatter;
    const courseHash = md5(courseRaw);

    console.log(`  Course: ${courseFm.title}`);
    console.log(`  ID: ${courseFm.id}`);
    console.log(`  Hash: ${courseHash}`);

    // ── 2. Upsert course ─────────────────────────────────────────────

    if (dryRun) {
      console.log(`  [dry-run] Would upsert course ${courseFm.id}`);
    } else {
      // Check existing hash
      const existing = await sql!`
        SELECT source_hash FROM content.courses WHERE id = ${courseFm.id}
      `;
      if (existing.length > 0 && existing[0].source_hash === courseHash) {
        console.log(`  Course unchanged, skipping upsert`);
      } else {
        await sql!`
          INSERT INTO content.courses (
            id, slug, title, summary, status, exam_target,
            target_audience, estimated_minutes, pass_threshold,
            domains, card_order, tags,
            source_hash, git_commit, published_at
          ) VALUES (
            ${courseFm.id}, ${slug}, ${courseFm.title}, ${courseFm.title},
            ${courseFm.status}, ${courseFm.exam_target},
            ${courseFm.target_audience}, ${courseFm.estimated_minutes},
            ${courseFm.pass_threshold},
            ${JSON.stringify(courseFm.domains)}::jsonb,
            ${courseFm.card_order ?? []},
            ${courseFm.tags ?? []},
            ${courseHash}, ${gitCommit}, now()
          )
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            status = EXCLUDED.status,
            exam_target = EXCLUDED.exam_target,
            target_audience = EXCLUDED.target_audience,
            estimated_minutes = EXCLUDED.estimated_minutes,
            pass_threshold = EXCLUDED.pass_threshold,
            domains = EXCLUDED.domains,
            card_order = EXCLUDED.card_order,
            tags = EXCLUDED.tags,
            source_hash = EXCLUDED.source_hash,
            git_commit = EXCLUDED.git_commit,
            published_at = EXCLUDED.published_at
        `;
        console.log(`  Course upserted`);
      }
    }
    totalCourses++;

    // ── 3. Process cards ─────────────────────────────────────────────

    const cardsDir = join(courseDir, "cards");
    const cardFiles = existsSync(cardsDir)
      ? readdirSync(cardsDir)
          .filter((f) => f.endsWith(".md"))
          .sort()
      : [];

    console.log(`  Cards found: ${cardFiles.length}`);

    for (const file of cardFiles) {
      const cardPath = join(cardsDir, file);
      const cardRaw = readFileSync(cardPath, "utf-8");
      const { frontmatter: cardFmRaw, body } = parseFrontmatter(cardRaw);
      const cardFm = cardFmRaw as unknown as CardFrontmatter;
      const cardHash = md5(cardRaw);

      const metadata = buildCardMetadata(cardFm);

      if (dryRun) {
        if (sql) {
          const existing = await sql`
            SELECT source_hash FROM content.cards WHERE id = ${cardFm.id}
          `;
          if (existing.length > 0 && existing[0].source_hash === cardHash) {
            console.log(`    [dry-run] ${file} -- unchanged, would skip`);
            totalCardsSkipped++;
          } else {
            console.log(`    [dry-run] ${file} -- would upsert (${cardFm.type}, order=${cardFm.order})`);
            totalCardsUpserted++;
          }
        } else {
          console.log(`    [dry-run] ${file} -- would upsert (${cardFm.type}, order=${cardFm.order})`);
          totalCardsUpserted++;
        }
        continue;
      }

      // Check existing hash
      const existing = await sql!`
        SELECT source_hash FROM content.cards WHERE id = ${cardFm.id}
      `;
      if (existing.length > 0 && existing[0].source_hash === cardHash) {
        console.log(`    ${file} -- unchanged, skipping`);
        totalCardsSkipped++;
        continue;
      }

      await sql!`
        INSERT INTO content.cards (
          id, course_slug, card_type, ord, difficulty,
          title, body_md, domain, metadata,
          wiki_refs, image_url, audio_url, source,
          content_hashes, source_hash
        ) VALUES (
          ${cardFm.id}, ${slug}, ${cardFm.type}, ${cardFm.order}, ${cardFm.difficulty},
          ${cardFm.title}, ${body.trim()}, ${cardFm.domain},
          ${JSON.stringify(metadata)}::jsonb,
          ${cardFm.wiki_refs ?? []},
          ${cardFm.image ?? null}, ${cardFm.audio ?? null},
          ${cardFm.source ?? null},
          ${JSON.stringify(cardFm.content_hashes ?? {})}::jsonb,
          ${cardHash}
        )
        ON CONFLICT (id) DO UPDATE SET
          course_slug = EXCLUDED.course_slug,
          card_type = EXCLUDED.card_type,
          ord = EXCLUDED.ord,
          difficulty = EXCLUDED.difficulty,
          title = EXCLUDED.title,
          body_md = EXCLUDED.body_md,
          domain = EXCLUDED.domain,
          metadata = EXCLUDED.metadata,
          wiki_refs = EXCLUDED.wiki_refs,
          image_url = EXCLUDED.image_url,
          audio_url = EXCLUDED.audio_url,
          source = EXCLUDED.source,
          content_hashes = EXCLUDED.content_hashes,
          source_hash = EXCLUDED.source_hash
      `;
      console.log(`    ${file} -- upserted (${cardFm.type}, order=${cardFm.order})`);
      totalCardsUpserted++;
    }

    // ── 4. Process graph.yaml ────────────────────────────────────────

    const graphPath = join(courseDir, "graph.yaml");
    if (existsSync(graphPath)) {
      const graphRaw = readFileSync(graphPath, "utf-8");
      const parsed = parseYaml(graphRaw);
      const concepts: Record<string, GraphConcept> = parsed?.concepts ?? {};
      const conceptKeys = Object.keys(concepts);

      console.log(`  Graph concepts: ${conceptKeys.length}`);

      for (const [concept, data] of Object.entries(concepts)) {
        if (dryRun) {
          console.log(`    [dry-run] graph: ${concept} -- would upsert`);
        } else {
          await sql!`
            INSERT INTO content.graphs (
              course_slug, concept, prerequisites, domain, wiki_page
            ) VALUES (
              ${slug}, ${concept},
              ${data.prerequisites ?? []},
              ${data.domain},
              ${data.wiki_page ?? null}
            )
            ON CONFLICT (course_slug, concept) DO UPDATE SET
              prerequisites = EXCLUDED.prerequisites,
              domain = EXCLUDED.domain,
              wiki_page = EXCLUDED.wiki_page
          `;
        }
        totalGraphConcepts++;
      }
      if (!dryRun) {
        console.log(`  Graph concepts upserted: ${conceptKeys.length}`);
      }
    } else {
      console.log(`  No graph.yaml found, skipping`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────

  console.log(`\n${"=".repeat(60)}`);
  console.log("PUBLISH SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Mode:             ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`  Git commit:       ${gitCommit}`);
  console.log(`  Courses:          ${totalCourses}`);
  console.log(`  Cards upserted:   ${totalCardsUpserted}`);
  console.log(`  Cards skipped:    ${totalCardsSkipped} (unchanged)`);
  console.log(`  Graph concepts:   ${totalGraphConcepts}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
