import { describe, it, expect } from "vitest";
import {
  evaluatePracticeTrigger,
  type AnswerEvent,
} from "@/lib/practice-trigger";

const a = (
  domain: string,
  correct: boolean,
  cardId = `c-${Math.random()}`,
): AnswerEvent => ({
  cardId,
  domain,
  type: "quiz",
  correct,
  timestamp: Date.now(),
});

describe("Phase 5 — practice trigger", () => {
  describe("hard trigger: 3-in-a-row wrong in same domain", () => {
    it("fires after 3 consecutive wrong answers in the same domain", () => {
      const history = [a("d1", false), a("d1", false), a("d1", false)];
      const r = evaluatePracticeTrigger(history);
      expect(r).toMatchObject({ shouldTrigger: true, reason: "hard", domain: "d1" });
    });

    it("does not fire after 2 wrong + 1 wrong with a correct in between", () => {
      const history = [a("d1", false), a("d1", true), a("d1", false), a("d1", false)];
      const r = evaluatePracticeTrigger(history);
      expect(r.shouldTrigger).toBe(false);
    });

    it("does not fire when wrongs span different domains", () => {
      const history = [a("d1", false), a("d2", false), a("d1", false)];
      const r = evaluatePracticeTrigger(history);
      expect(r.shouldTrigger).toBe(false);
    });
  });

  describe("soft trigger: <50% over last 5 quiz/scenario in same domain", () => {
    it("fires when 3 of last 5 are wrong in the same domain", () => {
      const history = [
        a("d1", true),
        a("d1", false),
        a("d1", false),
        a("d1", true),
        a("d1", false),
      ];
      const r = evaluatePracticeTrigger(history);
      expect(r).toMatchObject({ shouldTrigger: true, domain: "d1" });
    });

    it("does not fire when only 2 of last 5 are wrong", () => {
      const history = [
        a("d1", true),
        a("d1", false),
        a("d1", true),
        a("d1", true),
        a("d1", false),
      ];
      const r = evaluatePracticeTrigger(history);
      expect(r.shouldTrigger).toBe(false);
    });

    it("requires at least 5 same-domain answers before evaluating soft", () => {
      const history = [a("d1", false), a("d1", false), a("d2", true)];
      // Only 2 d1 answers; not enough for soft. Not enough for hard either.
      const r = evaluatePracticeTrigger(history);
      expect(r.shouldTrigger).toBe(false);
    });
  });

  describe("'don't ask again this session' suppression", () => {
    it("does not fire when domain is suppressed", () => {
      const history = [a("d1", false), a("d1", false), a("d1", false)];
      const r = evaluatePracticeTrigger(history, {
        suppressedDomains: new Set(["d1"]),
      });
      expect(r.shouldTrigger).toBe(false);
    });

    it("globally suppressed (sessionDontAskAgain) blocks all triggers", () => {
      const history = [a("d1", false), a("d1", false), a("d1", false)];
      const r = evaluatePracticeTrigger(history, {
        sessionDontAskAgain: true,
      });
      expect(r.shouldTrigger).toBe(false);
    });
  });

  it("returns the first domain that triggers when multiple qualify", () => {
    // Both domains hit hard; deterministic — earliest-completed-third-wrong wins.
    const history = [
      a("d1", false),
      a("d1", false),
      a("d2", false),
      a("d2", false),
      a("d2", false),
      a("d1", false),
    ];
    const r = evaluatePracticeTrigger(history);
    expect(r.shouldTrigger).toBe(true);
    // d2 reaches 3 wrongs at index 4, d1 reaches at index 5. d2 wins.
    expect(r.domain).toBe("d2");
  });
});
