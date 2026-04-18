#!/usr/bin/env npx tsx
/**
 * Media validator for course enrichment.
 * Checks audio/image blob URLs, enrichment hashes, and coverage.
 * Usage: npx tsx scripts/validate-media.ts courses/<slug>
 * Exit 0 = all checks pass, exit 1 = failures found.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";
import { createHash } from "crypto";

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

function md5(text: string): string {
  return createHash("md5").update(text).digest("hex").slice(0, 8);
}

async function checkUrl(
  url: string,
  expectedTypes: string[]
): Promise<{ ok: boolean; status?: number; contentType?: string; size?: number }> {
  try {
    const resp = await fetch(url, { method: "HEAD" });
    const contentType = resp.headers.get("content-type") ?? "";
    const size = parseInt(resp.headers.get("content-length") ?? "0", 10);
    const typeOk = expectedTypes.some((t) => contentType.includes(t));
    return { ok: resp.ok && typeOk, status: resp.status, contentType, size };
  } catch {
    return { ok: false };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

const courseDir = process.argv[2];
if (!courseDir) {
  console.error("Usage: npx tsx scripts/validate-media.ts courses/<slug>");
  process.exit(1);
}

const cardsDir = join(courseDir, "cards");
const hashesPath = join(courseDir, ".enrichment-hashes.json");

interface CardInfo {
  file: string;
  fm: any;
}

const cards: CardInfo[] = readdirSync(cardsDir)
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((file) => {
    const content = readFileSync(join(cardsDir, file), "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    return { file, fm: frontmatter };
  });

async function main() {
  // ══════════════════════════════════════════════════════════════════════════
  // BLOB CONNECTIVITY
  // ══════════════════════════════════════════════════════════════════════════

  console.log("\nBLOB CONNECTIVITY:");
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  check(
    typeof blobToken === "string" && blobToken.length > 0,
    "BLOB_READ_WRITE_TOKEN is set"
  );

  // ══════════════════════════════════════════════════════════════════════════
  // AUDIO CHECKS
  // ══════════════════════════════════════════════════════════════════════════

  console.log("\nAUDIO CHECKS:");

  const pageCardsWithNotes = cards.filter(
    (c) => c.fm.type === "page" && typeof c.fm.speaker_notes === "string" && c.fm.speaker_notes.trim()
  );

  await Promise.all(
    pageCardsWithNotes.map(async (c) => {
      const hasAudio = typeof c.fm.audio === "string" && c.fm.audio.startsWith("http");
      check(hasAudio, `[${c.file}] audio field is set`);
      if (hasAudio) {
        const result = await checkUrl(c.fm.audio, ["audio/mpeg", "audio/"]);
        check(result.ok && result.status === 200, `[${c.file}] audio URL accessible`, c.fm.audio);
        check(
          (result.size ?? 0) > 1024,
          `[${c.file}] audio file size >1KB`,
          `${result.size} bytes`
        );
      }
    })
  );

  // ══════════════════════════════════════════════════════════════════════════
  // IMAGE CHECKS
  // ══════════════════════════════════════════════════════════════════════════

  console.log("\nIMAGE CHECKS:");

  const cardsWithImages = cards.filter(
    (c) =>
      typeof c.fm.image === "string" &&
      c.fm.image.startsWith("http")
  );

  const cardsWithTodoImages = cards.filter(
    (c) =>
      typeof c.fm.image === "string" && c.fm.image.startsWith("TODO:")
  );

  for (const c of cardsWithImages) {
    const result = await checkUrl(c.fm.image, ["image/png", "image/jpeg", "image/webp"]);
    check(result.ok && result.status === 200, `[${c.file}] image URL accessible`, c.fm.image);
    check(
      (result.size ?? 0) > 1024,
      `[${c.file}] image file size >1KB`,
      `${result.size} bytes`
    );
  }

  check(
    cardsWithTodoImages.length === 0,
    `No cards with image: "TODO:*" remaining`,
    cardsWithTodoImages.map((c) => c.file).join(", ")
  );

  // ══════════════════════════════════════════════════════════════════════════
  // HASH CHECKS
  // ══════════════════════════════════════════════════════════════════════════

  console.log("\nHASH CHECKS:");

  const hashesExist = check(existsSync(hashesPath), ".enrichment-hashes.json exists");
  let hashes: Record<string, { audio_hash?: string; image_hash?: string }> = {};
  if (hashesExist) {
    hashes = JSON.parse(readFileSync(hashesPath, "utf-8"));

    for (const c of pageCardsWithNotes) {
      if (c.fm.audio) {
        check(
          hashes[c.file]?.audio_hash != null,
          `[${c.file}] has audio hash entry`
        );
        if (hashes[c.file]?.audio_hash) {
          const currentHash = md5(c.fm.speaker_notes);
          check(
            hashes[c.file].audio_hash === currentHash,
            `[${c.file}] audio hash is current`,
            `stored=${hashes[c.file].audio_hash} current=${currentHash}`
          );
        }
      }
    }

    for (const c of cardsWithImages) {
      check(
        hashes[c.file]?.image_hash != null,
        `[${c.file}] has image hash entry`
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COVERAGE
  // ══════════════════════════════════════════════════════════════════════════

  console.log("\nCOVERAGE:");

  const pagesWithAudio = pageCardsWithNotes.filter(
    (c) => typeof c.fm.audio === "string" && c.fm.audio.startsWith("http")
  );
  check(
    pagesWithAudio.length === pageCardsWithNotes.length,
    `Every page card with speaker_notes has audio`,
    `${pagesWithAudio.length}/${pageCardsWithNotes.length}`
  );

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════

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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
