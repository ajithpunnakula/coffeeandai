import { describe, it, expect } from "vitest";
import {
  parsePracticeOutput,
  buildPracticePrompt,
  validatePracticeRound,
} from "@/lib/practice-generator";

describe("Phase 5 — practice generator", () => {
  it("buildPracticePrompt embeds domain, level, and missed concepts", () => {
    const prompt = buildPracticePrompt({
      domain: "Tool Design",
      level: "intermediate",
      missedConcepts: [
        { cardTitle: "Tool Schemas", correctAnswer: "JSON schema", learnerPick: "ad-hoc string" },
      ],
    });
    expect(prompt).toContain("Tool Design");
    expect(prompt).toContain("intermediate");
    expect(prompt).toContain("Tool Schemas");
    expect(prompt).toContain("JSON schema");
    expect(prompt).toContain("ad-hoc string");
  });

  it("parses 3-question output", () => {
    const output = {
      questions: [
        {
          prompt: "Q1?",
          choices: [
            { text: "A", correct: true, explanation: "exA" },
            { text: "B", correct: false, explanation: "exB" },
            { text: "C", correct: false, explanation: "exC" },
            { text: "D", correct: false, explanation: "exD" },
          ],
        },
        {
          prompt: "Q2?",
          choices: [
            { text: "A", correct: false, explanation: "exA" },
            { text: "B", correct: true, explanation: "exB" },
            { text: "C", correct: false, explanation: "exC" },
            { text: "D", correct: false, explanation: "exD" },
          ],
        },
        {
          prompt: "Q3?",
          choices: [
            { text: "A", correct: false, explanation: "exA" },
            { text: "B", correct: false, explanation: "exB" },
            { text: "C", correct: true, explanation: "exC" },
            { text: "D", correct: false, explanation: "exD" },
          ],
        },
      ],
    };
    const parsed = parsePracticeOutput(output);
    expect(parsed.questions.length).toBe(3);
    expect(parsed.questions[0].choices[0].explanation).toBe("exA");
  });

  it("rejects fewer than 3 questions", () => {
    const output = {
      questions: [
        {
          prompt: "only one",
          choices: [
            { text: "A", correct: true, explanation: "" },
            { text: "B", correct: false, explanation: "" },
            { text: "C", correct: false, explanation: "" },
            { text: "D", correct: false, explanation: "" },
          ],
        },
      ],
    };
    expect(() => parsePracticeOutput(output)).toThrow();
  });

  it("rejects more than 5 questions", () => {
    const q = {
      prompt: "?",
      choices: [
        { text: "A", correct: true, explanation: "" },
        { text: "B", correct: false, explanation: "" },
        { text: "C", correct: false, explanation: "" },
        { text: "D", correct: false, explanation: "" },
      ],
    };
    expect(() =>
      parsePracticeOutput({ questions: Array.from({ length: 6 }, () => q) }),
    ).toThrow();
  });

  it("rejects question without exactly one correct choice", () => {
    expect(() =>
      parsePracticeOutput({
        questions: [
          {
            prompt: "?",
            choices: [
              { text: "A", correct: true, explanation: "" },
              { text: "B", correct: true, explanation: "" },
              { text: "C", correct: false, explanation: "" },
              { text: "D", correct: false, explanation: "" },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it("validatePracticeRound returns errors[] without throwing", () => {
    const r = validatePracticeRound({ questions: [] });
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });
});
