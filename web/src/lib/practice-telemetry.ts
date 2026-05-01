import type { TriggerReason } from "./practice-trigger";

export interface PracticeTelemetryEvent {
  userId: string | null;
  domain: string;
  triggeredBy: TriggerReason;
  questionsAttempted: number;
  questionsCorrect: number;
}

// Practice rounds are ephemeral; telemetry is fire-and-forget. We deliberately
// avoid touching learner.* tables — practice must never affect course
// progress. Errors are swallowed so a flaky DB never breaks the round.
export async function runPracticeRoundTelemetry(
  event: PracticeTelemetryEvent,
): Promise<void> {
  try {
    // Telemetry sink is Axiom (next-axiom) at the call site. This module is
    // intentionally a no-op against the database — Vitest covers the
    // invariant that no learner.* writes occur during practice.
    void event;
  } catch {
    // never throw out of telemetry
  }
}
