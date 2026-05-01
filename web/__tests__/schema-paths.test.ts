import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const schemaPath = resolve(__dirname, "../../db/schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

describe("Phase 1 — schema additions", () => {
  describe("content.courses level + topic_key plumbing", () => {
    it("courses has level column", () => {
      expect(schema).toMatch(/content\.courses[\s\S]*?level TEXT/m);
    });

    it("courses has topic_key column", () => {
      expect(schema).toMatch(/content\.courses[\s\S]*?topic_key TEXT/m);
    });

    it("course_drafts has level column", () => {
      expect(schema).toMatch(/content\.course_drafts[\s\S]*?level TEXT/m);
    });

    it("course_drafts has topic_key column", () => {
      expect(schema).toMatch(/content\.course_drafts[\s\S]*?topic_key TEXT/m);
    });
  });

  describe("learning_paths table", () => {
    it("defines content.learning_paths", () => {
      expect(schema).toContain("CREATE TABLE IF NOT EXISTS content.learning_paths");
    });

    it("learning_paths has slug, title, summary", () => {
      const match = schema.match(
        /CREATE TABLE IF NOT EXISTS content\.learning_paths\s*\(([\s\S]*?)\);/,
      );
      expect(match).not.toBeNull();
      const block = match![1];
      expect(block).toContain("slug TEXT UNIQUE NOT NULL");
      expect(block).toContain("title TEXT NOT NULL");
      expect(block).toContain("summary TEXT");
    });

    it("learning_paths has audience, level, tags, status, estimated_minutes", () => {
      const match = schema.match(
        /CREATE TABLE IF NOT EXISTS content\.learning_paths\s*\(([\s\S]*?)\);/,
      );
      const block = match![1];
      expect(block).toContain("audience TEXT");
      expect(block).toContain("level TEXT");
      expect(block).toContain("tags JSONB");
      expect(block).toContain("status TEXT");
      expect(block).toContain("estimated_minutes INT");
    });
  });

  describe("learning_path_courses join (M:N, ordered, required)", () => {
    it("defines content.learning_path_courses", () => {
      expect(schema).toContain(
        "CREATE TABLE IF NOT EXISTS content.learning_path_courses",
      );
    });

    it("learning_path_courses has path_id, course_id, position, required", () => {
      const match = schema.match(
        /CREATE TABLE IF NOT EXISTS content\.learning_path_courses\s*\(([\s\S]*?)\);/,
      );
      expect(match).not.toBeNull();
      const block = match![1];
      expect(block).toContain("path_id");
      expect(block).toContain("course_id");
      expect(block).toContain("position INT");
      expect(block).toContain("required BOOLEAN DEFAULT TRUE");
      expect(block).toContain("PRIMARY KEY (path_id, course_id)");
    });
  });

  describe("learning_path_drafts mirror", () => {
    it("defines content.learning_path_drafts", () => {
      expect(schema).toContain(
        "CREATE TABLE IF NOT EXISTS content.learning_path_drafts",
      );
    });

    it("defines content.learning_path_courses_draft", () => {
      expect(schema).toContain(
        "CREATE TABLE IF NOT EXISTS content.learning_path_courses_draft",
      );
    });
  });

  describe("learner.path_enrollments", () => {
    it("defines learner.path_enrollments", () => {
      expect(schema).toContain(
        "CREATE TABLE IF NOT EXISTS learner.path_enrollments",
      );
    });

    it("has user_id, path_id, started_at, completed_at", () => {
      const match = schema.match(
        /CREATE TABLE IF NOT EXISTS learner\.path_enrollments\s*\(([\s\S]*?)\);/,
      );
      expect(match).not.toBeNull();
      const block = match![1];
      expect(block).toContain("user_id");
      expect(block).toContain("path_id");
      expect(block).toContain("started_at");
      expect(block).toContain("completed_at");
    });
  });

  describe("role rename — author replaces developer in default", () => {
    it("learner.users role default is 'learner'", () => {
      expect(schema).toMatch(/learner\.users[\s\S]*?role TEXT DEFAULT 'learner'/);
    });
  });
});
