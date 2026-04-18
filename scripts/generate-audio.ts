#!/usr/bin/env npx tsx
/**
 * Batch TTS audio generation for course page cards.
 * Generates audio from speaker_notes, uploads to Vercel Blob, updates card frontmatter.
 * Usage: npx tsx scripts/generate-audio.ts courses/<slug>
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { createHash } from "crypto";

const courseDir = process.argv[2];
if (!courseDir) {
  console.error("Usage: npx tsx scripts/generate-audio.ts courses/<slug>");
  process.exit(1);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!OPENAI_API_KEY) { console.error("OPENAI_API_KEY not set"); process.exit(1); }
if (!BLOB_TOKEN) { console.error("BLOB_READ_WRITE_TOKEN not set"); process.exit(1); }

const cardsDir = join(courseDir, "cards");
const hashesPath = join(courseDir, ".enrichment-hashes.json");
const slug = courseDir.split("/").pop()!;

function md5(text: string): string {
  return createHash("md5").update(text).digest("hex").slice(0, 8);
}

function parseFrontmatter(content: string): { frontmatter: any; body: string; raw: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content, raw: "" };
  return { frontmatter: parseYaml(match[1]), body: match[2], raw: match[1] };
}

async function generateTTS(text: string): Promise<ArrayBuffer> {
  const resp = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      input: text,
      voice: "alloy",
      response_format: "mp3",
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`TTS API error ${resp.status}: ${err}`);
  }
  return resp.arrayBuffer();
}

async function uploadToBlob(data: ArrayBuffer, path: string): Promise<string> {
  const resp = await fetch(
    `https://blob.vercel-storage.com/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BLOB_TOKEN}`,
        "Content-Type": "audio/mpeg",
        "x-api-version": "7",
      },
      body: data,
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Blob upload error ${resp.status}: ${err}`);
  }
  const result = await resp.json() as { url: string };
  return result.url;
}

async function main() {
  // Load existing hashes
  let hashes: Record<string, { audio_hash?: string; image_hash?: string }> = {};
  if (existsSync(hashesPath)) {
    hashes = JSON.parse(readFileSync(hashesPath, "utf-8"));
  }

  // Find page cards with speaker_notes
  const cardFiles = readdirSync(cardsDir).filter((f) => f.endsWith(".md")).sort();
  const toProcess: { file: string; fm: any; content: string }[] = [];

  for (const file of cardFiles) {
    const filePath = join(cardsDir, file);
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter: fm } = parseFrontmatter(content);

    if (fm.type !== "page" || !fm.speaker_notes?.trim()) continue;

    const currentHash = md5(fm.speaker_notes);
    const existingHash = hashes[file]?.audio_hash;

    if (fm.audio && existingHash === currentHash) {
      console.log(`⏭  ${file} — already up to date`);
      continue;
    }

    toProcess.push({ file, fm, content });
  }

  console.log(`\n📢 Generating audio for ${toProcess.length} cards...\n`);

  // Process sequentially to avoid rate limits
  for (let i = 0; i < toProcess.length; i++) {
    const { file, fm, content } = toProcess[i];
    const cardId = fm.id;
    console.log(`[${i + 1}/${toProcess.length}] ${file}...`);

    try {
      // Generate TTS
      const audioData = await generateTTS(fm.speaker_notes);
      console.log(`  TTS: ${(audioData.byteLength / 1024).toFixed(0)}KB`);

      // Upload to Blob
      const blobPath = `courses/${slug}/audio/${cardId}.mp3`;
      const blobUrl = await uploadToBlob(audioData, blobPath);
      console.log(`  Blob: ${blobUrl}`);

      // Update card frontmatter — add audio field
      const filePath = join(cardsDir, file);
      let fileContent = readFileSync(filePath, "utf-8");

      if (fm.audio) {
        // Replace existing audio field
        fileContent = fileContent.replace(/^audio: .*$/m, `audio: "${blobUrl}"`);
      } else {
        // Add audio field after speaker_notes (or after source)
        // Find the end of frontmatter and add before ---
        const fmEnd = fileContent.indexOf("\n---", 4);
        if (fmEnd !== -1) {
          fileContent =
            fileContent.slice(0, fmEnd) +
            `\naudio: "${blobUrl}"` +
            fileContent.slice(fmEnd);
        }
      }
      writeFileSync(filePath, fileContent);

      // Update hash
      const currentHash = md5(fm.speaker_notes);
      hashes[file] = { ...hashes[file], audio_hash: currentHash };

      console.log(`  ✓ Done`);
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  // Write hashes
  writeFileSync(hashesPath, JSON.stringify(hashes, null, 2) + "\n");
  console.log(`\nWrote ${hashesPath}`);
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
