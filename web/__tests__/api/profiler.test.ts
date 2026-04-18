import { describe, it, expect } from "vitest";
import { parseProfileResponse, buildProfilerPrompt } from "@/lib/profiler";

describe("profiler", () => {
  it("parses valid profile response", () => {
    const text = JSON.stringify({
      domain_mastery: { "Agentic Architecture": 0.92, "Tool Design": 0.85 },
      weak_concepts: ["progressive summarization", "escalation patterns"],
      summary: "Strong on architecture, weak on context management.",
    });
    const result = parseProfileResponse(text);
    expect(result).not.toBeNull();
    expect(result!.domain_mastery["Agentic Architecture"]).toBe(0.92);
    expect(result!.weak_concepts).toContain("progressive summarization");
  });

  it("handles markdown-wrapped JSON", () => {
    const text =
      "Here is the analysis:\n```json\n" +
      JSON.stringify({
        domain_mastery: { D1: 0.8 },
        weak_concepts: [],
        summary: "Good overall.",
      }) +
      "\n```";
    const result = parseProfileResponse(text);
    expect(result).not.toBeNull();
    expect(result!.domain_mastery["D1"]).toBe(0.8);
  });

  it("rejects invalid domain scores", () => {
    const text = JSON.stringify({
      domain_mastery: { D1: 1.5 },
      weak_concepts: [],
      summary: "test",
    });
    expect(parseProfileResponse(text)).toBeNull();
  });

  it("rejects missing fields", () => {
    expect(parseProfileResponse('{"domain_mastery": {}}')).toBeNull();
    expect(parseProfileResponse("not json")).toBeNull();
  });

  it("builds prompt with domain data", () => {
    const prompt = buildProfilerPrompt({
      domainScores: { "Agentic Architecture": { correct: 8, total: 10 } },
      recentMisconceptions: ["confuses stop_reason with text parsing"],
      attemptPatterns: [{ card: "quiz-1", attempts: 3 }],
    });
    expect(prompt).toContain("Agentic Architecture: 8/10 correct (80%)");
    expect(prompt).toContain("confuses stop_reason with text parsing");
    expect(prompt).toContain("quiz-1 (3 attempts)");
  });
});
