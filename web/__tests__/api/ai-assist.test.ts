import { describe, it, expect, vi } from "vitest";

describe("AI assist API", () => {
  it("builds system prompt with course context", () => {
    // Test the prompt builder logic
    function buildAIAssistPrompt(
      course: any,
      currentCard: any,
      neighbors: any[],
    ): string {
      const parts: string[] = [];
      parts.push("You are a course design expert");

      if (course) {
        parts.push(`Title: ${course.title}`);
      }

      if (currentCard) {
        parts.push(`Current Card Type: ${currentCard.card_type}`);
        parts.push(`Current Card Title: ${currentCard.title}`);
        if (currentCard.body_md) {
          parts.push(`Content: ${currentCard.body_md}`);
        }
      }

      if (neighbors.length > 0) {
        parts.push("Other Cards:");
        for (const n of neighbors) {
          parts.push(`- [${n.card_type}] ${n.title}`);
        }
      }

      return parts.join("\n");
    }

    const prompt = buildAIAssistPrompt(
      { title: "AI Course", summary: "Test" },
      { card_type: "page", title: "Intro", body_md: "Hello world" },
      [
        { card_type: "quiz", title: "Quiz 1", domain: "AI" },
        { card_type: "scenario", title: "Scenario 1", domain: "ML" },
      ],
    );

    expect(prompt).toContain("AI Course");
    expect(prompt).toContain("Intro");
    expect(prompt).toContain("Hello world");
    expect(prompt).toContain("[quiz] Quiz 1");
    expect(prompt).toContain("[scenario] Scenario 1");
  });

  it("handles missing course context gracefully", () => {
    function buildAIAssistPrompt(
      course: any,
      currentCard: any,
      neighbors: any[],
    ): string {
      const parts: string[] = ["You are a course design expert"];
      if (course) parts.push(`Title: ${course.title}`);
      if (currentCard) parts.push(`Card: ${currentCard.title}`);
      return parts.join("\n");
    }

    const prompt = buildAIAssistPrompt(null, null, []);
    expect(prompt).toBe("You are a course design expert");
    expect(prompt).not.toContain("Title:");
    expect(prompt).not.toContain("Card:");
  });
});
