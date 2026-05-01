import { describe, it, expect } from "vitest";
import {
  parsePathProposal,
  validatePathProposal,
} from "@/lib/path-proposal";

describe("Phase 4 — LLM path proposal", () => {
  it("parses a well-formed proposal", () => {
    const obj = {
      title: "Kubernetes for Platform Engineers",
      summary: "From pods to production.",
      courses: [
        { title: "Kubernetes — Basics", level: "basic", required: true },
        {
          title: "Kubernetes — Workloads",
          level: "intermediate",
          required: true,
        },
        {
          title: "Kubernetes — Production Hardening",
          level: "advanced",
          required: false,
        },
      ],
    };
    const proposal = parsePathProposal(obj);
    expect(proposal.courses.length).toBe(3);
    expect(proposal.courses[0]).toMatchObject({
      title: "Kubernetes — Basics",
      level: "basic",
      position: 1,
      required: true,
    });
  });

  it("rejects fewer than 3 courses", () => {
    const obj = {
      title: "Tiny",
      courses: [{ title: "Only one", level: "basic", required: true }],
    };
    expect(() => parsePathProposal(obj)).toThrow();
  });

  it("rejects more than 6 courses", () => {
    const obj = {
      title: "Too big",
      courses: Array.from({ length: 7 }, (_, i) => ({
        title: `Course ${i + 1}`,
        level: "basic",
        required: true,
      })),
    };
    expect(() => parsePathProposal(obj)).toThrow();
  });

  it("rejects unknown level", () => {
    const obj = {
      title: "Bad",
      courses: [
        { title: "A", level: "basic", required: true },
        { title: "B", level: "expert", required: true },
        { title: "C", level: "basic", required: true },
      ],
    };
    expect(() => parsePathProposal(obj)).toThrow();
  });

  it("validatePathProposal returns errors[] without throwing", () => {
    const result = validatePathProposal({ title: "x", courses: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("assigns 1-based positions in the order courses appear", () => {
    const proposal = parsePathProposal({
      title: "T",
      courses: [
        { title: "A", level: "basic", required: true },
        { title: "B", level: "intermediate", required: true },
        { title: "C", level: "advanced", required: false },
      ],
    });
    expect(proposal.courses.map((c) => c.position)).toEqual([1, 2, 3]);
  });
});
