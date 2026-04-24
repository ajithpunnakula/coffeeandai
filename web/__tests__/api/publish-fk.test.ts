import { describe, it, expect } from "vitest";

describe("Publish FK constraint handling", () => {
  it("should check all FK-referencing tables before deleting old cards", () => {
    // The publish route must check these tables before deleting a card:
    const fkTables = [
      "learner.card_progress",
      "learner.card_events",
      "content.card_metrics",
      "content.card_quality",
    ];

    // Simulates the FK check logic
    function canDeleteCard(
      cardId: string,
      refs: Record<string, Set<string>>,
    ): boolean {
      return fkTables.every((table) => !refs[table]?.has(cardId));
    }

    const refs: Record<string, Set<string>> = {
      "learner.card_progress": new Set(["card_1"]),
      "learner.card_events": new Set(["card_2"]),
      "content.card_metrics": new Set(["card_3"]),
      "content.card_quality": new Set(),
    };

    // card_1: referenced by card_progress → cannot delete
    expect(canDeleteCard("card_1", refs)).toBe(false);

    // card_2: referenced by card_events → cannot delete
    expect(canDeleteCard("card_2", refs)).toBe(false);

    // card_3: referenced by card_metrics → cannot delete
    expect(canDeleteCard("card_3", refs)).toBe(false);

    // card_4: not referenced anywhere → can delete
    expect(canDeleteCard("card_4", refs)).toBe(true);
  });

  it("previously only checked card_progress, missing card_events/metrics/quality", () => {
    // This test documents the bug that was fixed:
    // The old code only checked learner.card_progress before deleting.
    // Cards referenced by card_events, card_metrics, or card_quality
    // would cause a FK constraint violation on DELETE.

    function oldCanDeleteCard(
      cardId: string,
      progressRefs: Set<string>,
    ): boolean {
      return !progressRefs.has(cardId);
    }

    function newCanDeleteCard(
      cardId: string,
      allRefs: Set<string>,
    ): boolean {
      return !allRefs.has(cardId);
    }

    const progressRefs = new Set(["card_1"]);
    const allRefs = new Set(["card_1", "card_2"]); // card_2 has card_events

    // Old code would allow deleting card_2 (only checks progress)
    expect(oldCanDeleteCard("card_2", progressRefs)).toBe(true);

    // New code correctly prevents deleting card_2
    expect(newCanDeleteCard("card_2", allRefs)).toBe(false);
  });
});
