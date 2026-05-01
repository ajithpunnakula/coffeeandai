import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/lib/db";
import {
  createPathDraft,
  getPathDraft,
  listPathDrafts,
  setPathCourses,
  updatePathDraft,
  deletePathDraft,
  publishPath,
} from "@/lib/path-db";

interface FakeRow {
  [k: string]: any;
}

function fakeSql(scenario: Record<string, FakeRow[]>) {
  const calls: string[] = [];
  const fn = vi.fn().mockImplementation((parts: TemplateStringsArray) => {
    const text = parts.join("?").trim();
    calls.push(text);

    // Match key fragments of the SQL to look up canned responses.
    for (const key of Object.keys(scenario)) {
      if (text.includes(key)) {
        return Promise.resolve(scenario[key]);
      }
    }
    return Promise.resolve([]);
  }) as any;
  fn.calls = calls;
  return fn;
}

describe("Phase 3 — path CRUD (mocked DB)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createPathDraft inserts and returns the draft row", async () => {
    const sql = fakeSql({
      "INSERT INTO content.learning_path_drafts": [
        {
          id: "p1",
          slug: "kubernetes-track",
          title: "Kubernetes Track",
          summary: null,
          status: "draft",
        },
      ],
    });
    (getDb as any).mockReturnValue(sql);

    const draft = await createPathDraft({
      slug: "kubernetes-track",
      title: "Kubernetes Track",
      userId: "u1",
    });

    expect(draft.slug).toBe("kubernetes-track");
    expect(sql.calls.some((c: string) => c.includes("INSERT INTO content.learning_path_drafts"))).toBe(true);
  });

  it("getPathDraft returns null for missing slug", async () => {
    const sql = fakeSql({});
    (getDb as any).mockReturnValue(sql);

    const draft = await getPathDraft("nope");
    expect(draft).toBeNull();
  });

  it("setPathCourses replaces rows in learning_path_courses_draft", async () => {
    const sql = fakeSql({
      "SELECT id FROM content.learning_path_drafts": [{ id: "path-id-1" }],
    });
    (getDb as any).mockReturnValue(sql);

    await setPathCourses("kubernetes-track", [
      { course_slug: "k8s-basic", required: true },
      { course_slug: "k8s-intermediate", required: true },
      { course_slug: "k8s-advanced", required: false },
    ]);

    const sqlText = sql.calls.join("\n");
    expect(sqlText).toContain("DELETE FROM content.learning_path_courses_draft");
    expect(sqlText).toContain("INSERT INTO content.learning_path_courses_draft");
  });

  it("listPathDrafts queries by created_by", async () => {
    const sql = fakeSql({
      "FROM content.learning_path_drafts": [{ id: "p1", slug: "k" }],
    });
    (getDb as any).mockReturnValue(sql);

    const drafts = await listPathDrafts("u1");
    expect(drafts.length).toBe(1);
    const sqlText = sql.calls.join("\n");
    expect(sqlText).toContain("created_by");
  });

  it("updatePathDraft applies allowed fields only", async () => {
    const sql = fakeSql({
      "UPDATE content.learning_path_drafts": [
        { slug: "k", title: "New" },
      ],
    });
    (getDb as any).mockReturnValue(sql);

    const updated = await updatePathDraft("k", {
      title: "New",
      // Disallowed: should be ignored without throwing
      created_by: "ATTACKER",
    });
    expect(updated?.title).toBe("New");
  });

  it("deletePathDraft removes the row", async () => {
    const sql = fakeSql({
      "DELETE FROM content.learning_path_drafts": [{ slug: "k" }],
    });
    (getDb as any).mockReturnValue(sql);

    const deleted = await deletePathDraft("k");
    expect(deleted).toBe(true);
  });

  it("publishPath inserts into content.learning_paths and learning_path_courses", async () => {
    const sql = fakeSql({
      "SELECT id FROM content.learning_path_drafts": [{ id: "draft-id-1" }],
      "FROM content.learning_path_drafts WHERE slug": [
        {
          id: "draft-id-1",
          slug: "k",
          title: "K",
          summary: null,
          audience: null,
          level: null,
          tags: null,
          estimated_minutes: 30,
        },
      ],
      "FROM content.learning_path_courses_draft": [
        { course_slug: "k8s-basic", position: 1, required: true },
      ],
      "FROM content.courses WHERE slug = ANY": [
        { id: "k8s-basic", slug: "k8s-basic" },
      ],
      "INTO content.learning_paths": [{ id: "path-id-1" }],
    });
    (getDb as any).mockReturnValue(sql);

    const published = await publishPath("k", "u1");
    const sqlText = sql.calls.join("\n");

    expect(published).toBeTruthy();
    expect(sqlText).toContain("INSERT INTO content.learning_paths");
    expect(sqlText).toContain("INSERT INTO content.learning_path_courses");
  });
});
