import { describe, it, expect } from "vitest";
import { groupCoursesByTopic, type CatalogCourse } from "@/lib/catalog";

const base: Omit<CatalogCourse, "id" | "slug" | "title" | "level" | "topic_key"> = {
  summary: "",
  estimated_minutes: 30,
  pass_threshold: 0.7,
  domains: [],
  card_count: 10,
};

describe("Phase 2 — browse catalog grouping", () => {
  it("groups three level variants of the same topic_key into one tile", () => {
    const courses: CatalogCourse[] = [
      { ...base, id: "1", slug: "k8s-basic", title: "Kubernetes Basics", level: "basic", topic_key: "kubernetes" },
      { ...base, id: "2", slug: "k8s-intermediate", title: "Kubernetes Practitioner", level: "intermediate", topic_key: "kubernetes" },
      { ...base, id: "3", slug: "k8s-advanced", title: "Kubernetes Expert", level: "advanced", topic_key: "kubernetes" },
    ];

    const tiles = groupCoursesByTopic(courses);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].topic_key).toBe("kubernetes");
    expect(tiles[0].levels.map((l) => l.level).sort()).toEqual([
      "advanced",
      "basic",
      "intermediate",
    ]);
  });

  it("renders single-level course as its own tile (no pills)", () => {
    const courses: CatalogCourse[] = [
      { ...base, id: "1", slug: "rag", title: "RAG", level: null, topic_key: null },
    ];
    const tiles = groupCoursesByTopic(courses);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].levels).toHaveLength(1);
    expect(tiles[0].levels[0].level).toBeNull();
  });

  it("courses with same topic_key but only one level form a single-pill tile", () => {
    const courses: CatalogCourse[] = [
      { ...base, id: "1", slug: "k8s-basic", title: "Kubernetes Basics", level: "basic", topic_key: "kubernetes" },
    ];
    const tiles = groupCoursesByTopic(courses);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].levels).toHaveLength(1);
    expect(tiles[0].levels[0].level).toBe("basic");
  });

  it("courses without topic_key are NOT grouped together", () => {
    const courses: CatalogCourse[] = [
      { ...base, id: "1", slug: "rag", title: "RAG", level: null, topic_key: null },
      { ...base, id: "2", slug: "agents", title: "Agents", level: null, topic_key: null },
    ];
    const tiles = groupCoursesByTopic(courses);
    expect(tiles).toHaveLength(2);
  });

  it("preserves level ordering: basic → intermediate → advanced", () => {
    const courses: CatalogCourse[] = [
      { ...base, id: "1", slug: "k-adv", title: "K Adv", level: "advanced", topic_key: "k" },
      { ...base, id: "2", slug: "k-basic", title: "K Basic", level: "basic", topic_key: "k" },
      { ...base, id: "3", slug: "k-int", title: "K Int", level: "intermediate", topic_key: "k" },
    ];
    const tiles = groupCoursesByTopic(courses);
    expect(tiles[0].levels.map((l) => l.level)).toEqual([
      "basic",
      "intermediate",
      "advanced",
    ]);
  });
});
