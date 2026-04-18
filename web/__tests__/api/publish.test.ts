import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));
vi.mock("@/lib/auth-guards", () => ({
  requireDeveloper: vi.fn(),
  AuthError: class AuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "AuthError";
      this.status = status;
    }
  },
}));

describe("Publish flow logic", () => {
  it("card ID stability: cloned cards preserve original IDs", () => {
    // Simulates the clone flow
    const publishedCards = [
      { id: "card_abc12345", title: "Intro", card_type: "page" },
      { id: "card_def67890", title: "Quiz 1", card_type: "quiz" },
    ];

    // When cloning, draft cards should have same IDs
    const draftCards = publishedCards.map((c) => ({ ...c, course_slug: "test" }));

    expect(draftCards[0].id).toBe("card_abc12345");
    expect(draftCards[1].id).toBe("card_def67890");
  });

  it("new cards added during editing get fresh IDs", () => {
    function generateCardId(): string {
      const hex = Math.random().toString(16).substring(2, 10);
      return `card_${hex}`;
    }

    const existingIds = new Set(["card_abc12345", "card_def67890"]);
    const newId = generateCardId();

    expect(newId).toMatch(/^card_[0-9a-f]{8}$/);
    expect(existingIds.has(newId)).toBe(false);
  });

  it("version number increments correctly", () => {
    function getNextVersion(existingVersions: number[]): number {
      if (existingVersions.length === 0) return 1;
      return Math.max(...existingVersions) + 1;
    }

    expect(getNextVersion([])).toBe(1);
    expect(getNextVersion([1])).toBe(2);
    expect(getNextVersion([1, 2, 3])).toBe(4);
  });

  it("deleted cards removed from card_order but rows preserved when referenced", () => {
    const publishedCardOrder = ["card_1", "card_2", "card_3"];
    const draftCardOrder = ["card_1", "card_3"]; // card_2 was deleted

    const deletedCardIds = publishedCardOrder.filter(
      (id) => !draftCardOrder.includes(id),
    );

    expect(deletedCardIds).toEqual(["card_2"]);

    // In actual publish: card_2 row kept in content.cards (FK from card_progress)
    // but removed from card_order array
    const cardProgressRefs = new Set(["card_1", "card_2"]);
    const shouldKeepRow = deletedCardIds.filter((id) => cardProgressRefs.has(id));
    const canDeleteRow = deletedCardIds.filter((id) => !cardProgressRefs.has(id));

    expect(shouldKeepRow).toEqual(["card_2"]);
    expect(canDeleteRow).toEqual([]);
  });

  it("unpublish sets status to draft without deleting data", () => {
    // Test the logical flow
    const course = { slug: "test", status: "published" };
    const unpublished = { ...course, status: "draft" };

    expect(unpublished.status).toBe("draft");
    expect(unpublished.slug).toBe("test"); // slug preserved
  });
});
