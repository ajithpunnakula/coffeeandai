import { describe, it, expect } from "vitest";
import { buildSystemPrompt, TutorContext } from "@/lib/tutor-context";

describe("tutor context assembly", () => {
  it("includes current card body in context", () => {
    const ctx: TutorContext = {
      cardBody: "The agentic loop is Claude's core execution model.",
      prerequisites: [],
      wikiRefs: [],
      history: [],
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain(
      "The agentic loop is Claude's core execution model."
    );
  });

  it("includes prerequisite concepts", () => {
    const ctx: TutorContext = {
      cardBody: "Multi-agent orchestration",
      prerequisites: [
        "Agentic Loop: read-think-act cycle",
        "Subagents: isolated contexts",
      ],
      wikiRefs: [],
      history: [],
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Agentic Loop: read-think-act cycle");
    expect(prompt).toContain("Subagents: isolated contexts");
  });

  it("includes learner profile when available", () => {
    const ctx: TutorContext = {
      cardBody: "Context management",
      prerequisites: [],
      wikiRefs: [],
      profile: {
        summary:
          "Strong on Agentic Architecture (92%). Weak on Context Management (54%).",
        weak_concepts: ["progressive summarization", "escalation patterns"],
      },
      history: [],
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Weak on Context Management (54%)");
    expect(prompt).toContain("progressive summarization");
  });

  it("includes wiki refs content", () => {
    const ctx: TutorContext = {
      cardBody: "Hooks and enforcement",
      prerequisites: [],
      wikiRefs: [
        "Hooks: shell commands on lifecycle events",
        "Permission Modes: six modes",
      ],
      history: [],
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Hooks: shell commands on lifecycle events");
  });

  it("stays under reasonable token budget", () => {
    const ctx: TutorContext = {
      cardBody: "A".repeat(2000),
      prerequisites: Array(5).fill("Concept: " + "B".repeat(500)),
      wikiRefs: Array(3).fill("Wiki: " + "C".repeat(500)),
      profile: { summary: "D".repeat(500), weak_concepts: ["e1", "e2"] },
      history: Array(5).fill({ role: "user", content: "F".repeat(200) }),
    };
    const prompt = buildSystemPrompt(ctx);
    // Prompt should be substantial but not enormous
    expect(prompt.length).toBeGreaterThan(1000);
    expect(prompt.length).toBeLessThan(20000);
  });
});
