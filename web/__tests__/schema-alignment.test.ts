import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Regression test: verify SQL queries reference columns that exist in the schema.
 *
 * Bug context: queries referenced non-existent tables (content.domains),
 * wrong column names (body vs body_md, course_id vs course_slug, etc.),
 * and wrong column types (::jsonb cast on TEXT[] columns).
 */

const schemaPath = resolve(__dirname, "../../db/schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

describe("schema alignment", () => {
  describe("content.courses columns", () => {
    it("has slug, not name", () => {
      expect(schema).toContain("slug TEXT UNIQUE NOT NULL");
    });

    it("has status, not published", () => {
      expect(schema).toContain("status TEXT DEFAULT 'draft'");
    });

    it("has published_at, not created_at", () => {
      expect(schema).toContain("published_at TIMESTAMPTZ DEFAULT now()");
    });

    it("has domains as JSONB", () => {
      expect(schema).toContain("domains JSONB");
    });

    it("has card_order as TEXT[], not JSONB", () => {
      expect(schema).toContain("card_order TEXT[]");
    });

    it("has tags as TEXT[], not JSONB", () => {
      expect(schema).toContain("tags TEXT[]");
    });
  });

  describe("content.cards columns", () => {
    it("has body_md, not body", () => {
      expect(schema).toContain("body_md TEXT");
    });

    it("has course_slug, not course_id", () => {
      expect(schema).toContain("course_slug TEXT NOT NULL");
    });

    it("has domain as TEXT, not domain_id FK", () => {
      expect(schema).toContain("domain TEXT");
    });

    it("has ord, not position", () => {
      expect(schema).toContain("ord INT NOT NULL");
    });

    it("has wiki_refs as TEXT[], not JSONB", () => {
      expect(schema).toContain("wiki_refs TEXT[]");
    });
  });

  describe("content.graphs columns", () => {
    it("has prerequisites as TEXT[]", () => {
      expect(schema).toContain("prerequisites TEXT[]");
    });

    it("does not have from_card_id or to_card_id", () => {
      expect(schema).not.toContain("from_card_id");
      expect(schema).not.toContain("to_card_id");
    });
  });

  describe("learner.enrollments columns", () => {
    it("has course_slug, not course_id", () => {
      expect(schema).toMatch(/learner\.enrollments[\s\S]*?course_slug TEXT NOT NULL/m);
    });

    it("has composite PK of user_id and course_slug", () => {
      expect(schema).toMatch(/PRIMARY KEY \(user_id, course_slug\)/);
    });
  });

  describe("learner.profiles columns", () => {
    it("has summary_md, not summary", () => {
      expect(schema).toContain("summary_md TEXT");
    });
  });

  describe("non-existent tables", () => {
    it("content.domains does not exist", () => {
      expect(schema).not.toContain("CREATE TABLE IF NOT EXISTS content.domains");
    });
  });
});
