import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const schemaPath = resolve(__dirname, "../../db/schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

const migrationPath = resolve(
  __dirname,
  "../../scripts/migrate-001-drafts.sql",
);
const migration = readFileSync(migrationPath, "utf-8");

describe("Draft schema tables", () => {
  it("defines content.course_drafts with required columns", () => {
    expect(schema).toContain("content.course_drafts");
    expect(schema).toContain("created_by UUID");
    expect(schema).toContain("created_at TIMESTAMPTZ");
    expect(schema).toContain("updated_at TIMESTAMPTZ");
  });

  it("defines content.card_drafts with course_slug FK", () => {
    expect(schema).toContain("content.card_drafts");
    expect(schema).toMatch(
      /card_drafts[\s\S]*?course_slug TEXT NOT NULL REFERENCES content\.course_drafts\(slug\)/,
    );
  });

  it("defines content.graph_drafts", () => {
    expect(schema).toContain("content.graph_drafts");
  });

  it("card_drafts does NOT have source_hash or content_hashes", () => {
    // Extract just the card_drafts CREATE TABLE block
    const match = schema.match(
      /CREATE TABLE IF NOT EXISTS content\.card_drafts\s*\(([\s\S]*?)\);/,
    );
    expect(match).not.toBeNull();
    const block = match![1];
    expect(block).not.toContain("source_hash");
    expect(block).not.toContain("content_hashes");
  });

  it("course_drafts does NOT have source_hash or git_commit", () => {
    const match = schema.match(
      /CREATE TABLE IF NOT EXISTS content\.course_drafts\s*\(([\s\S]*?)\);/,
    );
    expect(match).not.toBeNull();
    const block = match![1];
    expect(block).not.toContain("source_hash");
    expect(block).not.toContain("git_commit");
  });
});

describe("Version history tables", () => {
  it("defines content.course_versions with version number", () => {
    expect(schema).toContain("content.course_versions");
    expect(schema).toMatch(/course_versions[\s\S]*?version INT NOT NULL/);
  });

  it("defines content.card_versions with version_id FK", () => {
    expect(schema).toContain("content.card_versions");
    expect(schema).toMatch(
      /card_versions[\s\S]*?version_id UUID NOT NULL REFERENCES content\.course_versions\(id\)/,
    );
  });

  it("course_versions has unique constraint on (slug, version)", () => {
    expect(schema).toMatch(
      /course_versions[\s\S]*?UNIQUE\s*\(slug,\s*version\)/,
    );
  });
});

describe("Edit history table", () => {
  it("defines content.edit_history with action check constraint", () => {
    expect(schema).toContain("content.edit_history");
    expect(schema).toContain("manual_edit");
    expect(schema).toContain("ai_accept");
    expect(schema).toContain("ai_reject");
    expect(schema).toContain("before_snapshot JSONB");
    expect(schema).toContain("after_snapshot JSONB");
  });
});

describe("published_version_id on courses", () => {
  it("adds published_version_id column to content.courses", () => {
    expect(schema).toContain("published_version_id UUID");
  });
});

describe("Migration script alignment", () => {
  it("migration creates same tables as schema", () => {
    expect(migration).toContain("content.course_drafts");
    expect(migration).toContain("content.card_drafts");
    expect(migration).toContain("content.graph_drafts");
    expect(migration).toContain("content.course_versions");
    expect(migration).toContain("content.card_versions");
    expect(migration).toContain("content.edit_history");
  });

  it("migration is idempotent (uses IF NOT EXISTS)", () => {
    const createStatements = migration.match(/CREATE TABLE/g) ?? [];
    const ifNotExists = migration.match(/CREATE TABLE IF NOT EXISTS/g) ?? [];
    expect(createStatements.length).toBe(ifNotExists.length);
  });
});

describe("Backward compatibility", () => {
  it("content.courses table still exists with original columns", () => {
    expect(schema).toContain("content.courses");
    expect(schema).toMatch(/content\.courses[\s\S]*?source_hash TEXT/);
    expect(schema).toMatch(/content\.courses[\s\S]*?git_commit TEXT/);
  });

  it("content.cards table still exists with original columns", () => {
    expect(schema).toContain("content.cards");
    expect(schema).toMatch(/content\.cards[\s\S]*?content_hashes JSONB/);
    expect(schema).toMatch(/content\.cards[\s\S]*?source_hash TEXT/);
  });

  it("learner tables unchanged", () => {
    expect(schema).toContain("learner.users");
    expect(schema).toContain("learner.enrollments");
    expect(schema).toContain("learner.card_progress");
  });
});
