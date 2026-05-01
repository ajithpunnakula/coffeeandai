import { describe, it, expect } from "vitest";
import {
  recommendedLevel,
  scoreAssessment,
  PRE_ASSESSMENT_QUESTIONS,
} from "@/lib/pre-assessment";

describe("Phase 4 — pre-assessment scoring", () => {
  it("exposes exactly 5 questions", () => {
    expect(PRE_ASSESSMENT_QUESTIONS.length).toBe(5);
    for (const q of PRE_ASSESSMENT_QUESTIONS) {
      expect(q.choices.length).toBeGreaterThanOrEqual(3);
      // Each choice carries an integer weight (skill-signal).
      for (const c of q.choices) {
        expect(typeof c.weight).toBe("number");
      }
    }
  });

  it("all-zero (no skill) signals → basic", () => {
    expect(recommendedLevel([0, 0, 0, 0, 0])).toBe("basic");
  });

  it("middling signals → intermediate", () => {
    // 5 answers each worth ~1.5 → score ≈ 7.5 → intermediate band
    expect(recommendedLevel([1, 2, 1, 2, 2])).toBe("intermediate");
  });

  it("all-high signals → advanced", () => {
    expect(recommendedLevel([3, 3, 3, 3, 3])).toBe("advanced");
  });

  it("is deterministic — same input always returns same level", () => {
    for (let i = 0; i < 10; i++) {
      expect(recommendedLevel([2, 2, 1, 1, 2])).toBe(
        recommendedLevel([2, 2, 1, 1, 2]),
      );
    }
  });

  it("scoreAssessment returns numeric score + level + raw answers", () => {
    const result = scoreAssessment([0, 1, 2, 3, 0]);
    expect(typeof result.score).toBe("number");
    expect(["basic", "intermediate", "advanced"]).toContain(result.level);
    expect(result.answers).toEqual([0, 1, 2, 3, 0]);
  });

  it("answers shorter than 5 throws (caller must collect all)", () => {
    expect(() => recommendedLevel([0, 0, 0, 0])).toThrow();
  });

  it("answers with out-of-range index throws", () => {
    expect(() => recommendedLevel([0, 0, 0, 0, 99])).toThrow();
  });
});
