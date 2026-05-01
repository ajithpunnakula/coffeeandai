/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/lib/db";
import { runPracticeRoundTelemetry } from "@/lib/practice-telemetry";

describe("Phase 5 — practice rounds never touch learner.card_progress", () => {
  let calls: string[];
  let sql: any;

  beforeEach(() => {
    calls = [];
    sql = vi.fn().mockImplementation((parts: TemplateStringsArray) => {
      calls.push(parts.join("?"));
      return Promise.resolve([]);
    }) as any;
    (getDb as any).mockReturnValue(sql);
  });

  it("runPracticeRoundTelemetry never writes to learner.card_progress", async () => {
    await runPracticeRoundTelemetry({
      userId: "u1",
      domain: "d1",
      triggeredBy: "hard",
      questionsAttempted: 3,
      questionsCorrect: 2,
    });

    const allSql = calls.join("\n");
    expect(allSql).not.toMatch(/learner\.card_progress/i);
    expect(allSql).not.toMatch(/INSERT INTO learner\./i);
    expect(allSql).not.toMatch(/UPDATE learner\./i);
  });

  it("practice telemetry is fire-and-forget — does not throw if DB is offline", async () => {
    sql.mockImplementationOnce(() => {
      throw new Error("connection refused");
    });

    await expect(
      runPracticeRoundTelemetry({
        userId: "u1",
        domain: "d1",
        triggeredBy: "manual",
        questionsAttempted: 3,
        questionsCorrect: 0,
      }),
    ).resolves.not.toThrow();
  });
});
