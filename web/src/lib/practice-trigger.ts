export type AnswerType = "quiz" | "scenario";

export interface AnswerEvent {
  cardId: string;
  domain: string;
  type: AnswerType;
  correct: boolean;
  timestamp: number;
}

export type TriggerReason = "hard" | "soft" | "manual";

export interface TriggerEvaluation {
  shouldTrigger: boolean;
  reason: TriggerReason | null;
  domain: string | null;
}

export interface TriggerOptions {
  suppressedDomains?: Set<string>;
  sessionDontAskAgain?: boolean;
  windowSize?: number;
  hardStreak?: number;
  softThreshold?: number;
}

const NO_TRIGGER: TriggerEvaluation = {
  shouldTrigger: false,
  reason: null,
  domain: null,
};

export function evaluatePracticeTrigger(
  history: AnswerEvent[],
  opts: TriggerOptions = {},
): TriggerEvaluation {
  if (opts.sessionDontAskAgain) return NO_TRIGGER;

  const suppressed = opts.suppressedDomains ?? new Set<string>();
  const windowSize = opts.windowSize ?? 5;
  const hardStreak = opts.hardStreak ?? 3;
  const softThreshold = opts.softThreshold ?? 0.5;

  const ordered = history
    .filter((e) => e.type === "quiz" || e.type === "scenario")
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp || 0);

  // Hard: scan in chronological order; the first domain to reach a
  // `hardStreak` consecutive-wrong streak triggers, with deterministic
  // ordering by completion of the streak.
  const consecutiveWrong: Record<string, number> = {};
  for (const event of ordered) {
    if (suppressed.has(event.domain)) {
      consecutiveWrong[event.domain] = 0;
      continue;
    }
    if (event.correct) {
      consecutiveWrong[event.domain] = 0;
    } else {
      consecutiveWrong[event.domain] = (consecutiveWrong[event.domain] ?? 0) + 1;
      if (consecutiveWrong[event.domain] >= hardStreak) {
        return {
          shouldTrigger: true,
          reason: "hard",
          domain: event.domain,
        };
      }
    }
  }

  // Soft: <softThreshold accuracy over last `windowSize` quiz/scenario in same
  // domain. We evaluate per-domain using the most recent windowSize entries.
  const byDomain: Record<string, AnswerEvent[]> = {};
  for (const e of ordered) {
    if (suppressed.has(e.domain)) continue;
    (byDomain[e.domain] ??= []).push(e);
  }
  // Iterate domains in the chronological order of their most-recent answer
  // so a deterministic winner emerges when multiple qualify.
  const domains = Object.keys(byDomain).sort((a, b) => {
    const lastA = byDomain[a][byDomain[a].length - 1].timestamp;
    const lastB = byDomain[b][byDomain[b].length - 1].timestamp;
    return lastA - lastB;
  });
  for (const domain of domains) {
    const entries = byDomain[domain];
    if (entries.length < windowSize) continue;
    const window = entries.slice(-windowSize);
    const correct = window.filter((e) => e.correct).length;
    const accuracy = correct / window.length;
    if (accuracy < softThreshold) {
      return {
        shouldTrigger: true,
        reason: "soft",
        domain,
      };
    }
  }

  return NO_TRIGGER;
}
