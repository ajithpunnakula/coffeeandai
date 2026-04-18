import { describe, it, expect } from "vitest";
import { validateCard } from "@/lib/course-generator";

describe("validateCard", () => {
  describe("quiz cards", () => {
    it("validates a correct quiz", () => {
      const metadata = {
        questions: [
          {
            prompt: "What is AI?",
            choices: [
              { text: "A", correct: true },
              { text: "B", correct: false, misconception: "Not quite" },
              { text: "C", correct: false, misconception: "Wrong" },
              { text: "D", correct: false, misconception: "Nope" },
            ],
          },
        ],
        pass_threshold: 0.7,
      };
      const result = validateCard("quiz", metadata);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects quiz with fewer than 4 choices", () => {
      const metadata = {
        questions: [
          {
            prompt: "Q?",
            choices: [
              { text: "A", correct: true },
              { text: "B", correct: false },
            ],
          },
        ],
        pass_threshold: 0.7,
      };
      const result = validateCard("quiz", metadata);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least 4 choices"))).toBe(true);
    });

    it("rejects quiz with no questions", () => {
      const result = validateCard("quiz", { questions: [] });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least one question"))).toBe(true);
    });

    it("rejects quiz with multiple correct answers", () => {
      const metadata = {
        questions: [
          {
            prompt: "Q?",
            choices: [
              { text: "A", correct: true },
              { text: "B", correct: true },
              { text: "C", correct: false },
              { text: "D", correct: false },
            ],
          },
        ],
        pass_threshold: 0.7,
      };
      const result = validateCard("quiz", metadata);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exactly 1 correct"))).toBe(true);
    });

    it("warns about missing misconceptions", () => {
      const metadata = {
        questions: [
          {
            prompt: "Q?",
            choices: [
              { text: "A", correct: true },
              { text: "B", correct: false },
              { text: "C", correct: false },
              { text: "D", correct: false },
            ],
          },
        ],
        pass_threshold: 0.7,
      };
      const result = validateCard("quiz", metadata);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("misconception"))).toBe(true);
    });
  });

  describe("scenario cards", () => {
    it("validates a correct scenario", () => {
      const metadata = {
        steps: [
          {
            id: "start",
            situation: "You find a bug",
            choices: [{ text: "Fix it", next: "end", score: 1 }],
          },
          { id: "end", situation: "Bug fixed!", outcome: "Great work" },
        ],
      };
      const result = validateCard("scenario", metadata);
      expect(result.valid).toBe(true);
    });

    it("rejects scenario with fewer than 2 steps", () => {
      const metadata = {
        steps: [{ id: "start", situation: "Hello" }],
      };
      const result = validateCard("scenario", metadata);
      expect(result.valid).toBe(false);
    });

    it("rejects scenario with no outcome step", () => {
      const metadata = {
        steps: [
          { id: "s1", situation: "A", choices: [{ text: "Go", next: "s2", score: 1 }] },
          { id: "s2", situation: "B", choices: [{ text: "Go", next: "s1", score: 1 }] },
        ],
      };
      const result = validateCard("scenario", metadata);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("outcome"))).toBe(true);
    });
  });

  describe("reflection cards", () => {
    it("validates a correct reflection", () => {
      const result = validateCard("reflection", {
        prompt: "What did you learn about AI today?",
      });
      expect(result.valid).toBe(true);
    });

    it("rejects reflection with short prompt", () => {
      const result = validateCard("reflection", { prompt: "What?" });
      expect(result.valid).toBe(false);
    });

    it("rejects reflection with empty prompt", () => {
      const result = validateCard("reflection", { prompt: "" });
      expect(result.valid).toBe(false);
    });
  });

  describe("page cards", () => {
    it("always validates page cards", () => {
      const result = validateCard("page", {});
      expect(result.valid).toBe(true);
    });
  });
});
