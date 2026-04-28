import { describe, it, expect } from "vitest";
import { sanitizeEditFields } from "@/lib/sanitize-edit-proposal";

describe("sanitizeEditFields", () => {
  it("drops empty placeholder quiz questions", () => {
    const out = sanitizeEditFields({
      metadata: {
        questions: [
          {
            prompt: "What is X?",
            choices: [
              { text: "A", correct: true },
              { text: "B", correct: false },
            ],
          },
          {},
          { prompt: "" },
          { prompt: "Real Q", choices: [] },
          {
            prompt: "Q3",
            choices: [
              { text: "", correct: false },
              { text: "Real choice", correct: true },
            ],
          },
        ],
        pass_threshold: 0.7,
      },
    });
    expect(out.metadata.questions).toHaveLength(2);
    expect(out.metadata.questions[0].prompt).toBe("What is X?");
    expect(out.metadata.questions[1].prompt).toBe("Q3");
    expect(out.metadata.questions[1].choices).toHaveLength(1);
    expect(out.metadata.pass_threshold).toBe(0.7);
  });

  it("drops empty placeholder scenario steps", () => {
    const out = sanitizeEditFields({
      metadata: {
        steps: [
          { id: "start", situation: "S", choices: [] },
          {},
          { id: "" },
          { id: "win", outcome: "You won" },
        ],
      },
    });
    expect(out.metadata.steps).toHaveLength(2);
    expect(out.metadata.steps[0].id).toBe("start");
    expect(out.metadata.steps[1].id).toBe("win");
  });

  it("leaves non-quiz/scenario metadata untouched", () => {
    const out = sanitizeEditFields({
      metadata: { prompt: "Reflect on what you learned" },
    });
    expect(out.metadata).toEqual({ prompt: "Reflect on what you learned" });
  });

  it("passes through when no metadata present", () => {
    expect(sanitizeEditFields({ title: "New" })).toEqual({ title: "New" });
  });
});
