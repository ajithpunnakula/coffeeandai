import { describe, it, expect } from "vitest";
import {
  buildPlanPrompt,
  derivePlannedSlug,
  topicKeyFor,
  type Level,
} from "@/lib/course-generator";

describe("Phase 2 — level-aware course planning", () => {
  describe("buildPlanPrompt", () => {
    it("includes the topic verbatim", () => {
      const p = buildPlanPrompt({ topic: "Kubernetes", level: null });
      expect(p).toContain("Kubernetes");
    });

    it("when level is basic, prompts for foundational scope", () => {
      const p = buildPlanPrompt({ topic: "Kubernetes", level: "basic" });
      expect(p.toLowerCase()).toMatch(/basic|beginner|foundational|introductory/);
      // Difficulty hint should bias low
      expect(p.toLowerCase()).toMatch(/0\s*[-–]\s*1|difficulty.*0|low difficulty/);
    });

    it("when level is intermediate, prompts for working knowledge", () => {
      const p = buildPlanPrompt({ topic: "Kubernetes", level: "intermediate" });
      expect(p.toLowerCase()).toMatch(/intermediate|working knowledge|practitioner/);
      expect(p.toLowerCase()).toMatch(/1\s*[-–]\s*2|difficulty.*1.*2/);
    });

    it("when level is advanced, prompts for expert depth", () => {
      const p = buildPlanPrompt({ topic: "Kubernetes", level: "advanced" });
      expect(p.toLowerCase()).toMatch(/advanced|expert|deep/);
      expect(p.toLowerCase()).toMatch(/2\s*[-–]\s*3|difficulty.*2.*3/);
    });

    it("includes audience when provided", () => {
      const p = buildPlanPrompt({
        topic: "Kubernetes",
        level: "basic",
        audience: "platform engineers",
      });
      expect(p).toContain("platform engineers");
    });

    it("includes wikiContent when provided", () => {
      const p = buildPlanPrompt({
        topic: "Kubernetes",
        level: null,
        wikiContent: "## Etcd is a key-value store",
      });
      expect(p).toContain("Etcd is a key-value store");
    });
  });

  describe("derivePlannedSlug + topicKeyFor", () => {
    const cases: Array<[string, Level | null, string, string]> = [
      ["Kubernetes", null, "kubernetes", "kubernetes"],
      ["Kubernetes", "basic", "kubernetes-basic", "kubernetes"],
      ["Kubernetes", "intermediate", "kubernetes-intermediate", "kubernetes"],
      ["Kubernetes", "advanced", "kubernetes-advanced", "kubernetes"],
      ["AI Agents 101", "advanced", "ai-agents-101-advanced", "ai-agents-101"],
    ];
    for (const [topic, level, expectedSlug, expectedKey] of cases) {
      it(`topic=${topic} level=${level} → slug=${expectedSlug}, topic_key=${expectedKey}`, () => {
        expect(derivePlannedSlug(topic, level)).toBe(expectedSlug);
        expect(topicKeyFor(topic)).toBe(expectedKey);
      });
    }

    it("the three levels share the same topic_key but have distinct slugs", () => {
      const t = "Kubernetes";
      const slugs = (["basic", "intermediate", "advanced"] as const).map((l) =>
        derivePlannedSlug(t, l),
      );
      expect(new Set(slugs).size).toBe(3);
      const keys = (["basic", "intermediate", "advanced"] as const).map(() =>
        topicKeyFor(t),
      );
      expect(new Set(keys).size).toBe(1);
    });
  });
});
