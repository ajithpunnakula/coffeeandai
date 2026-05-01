"use client";

import { useEffect, useMemo, useState } from "react";
import type { PracticeRound, PracticeQuestion } from "@/lib/practice-generator";
import type { TriggerReason } from "@/lib/practice-trigger";

interface Props {
  round: PracticeRound;
  domain: string;
  triggeredBy: TriggerReason;
  storageKey?: string;
  onClose: (result: {
    completed: boolean;
    questionsAttempted: number;
    questionsCorrect: number;
  }) => void;
}

interface SessionState {
  index: number;
  picks: (number | null)[];
  finished: boolean;
}

function loadState(
  storageKey: string,
  qCount: number,
): SessionState {
  if (typeof window === "undefined") {
    return { index: 0, picks: Array(qCount).fill(null), finished: false };
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return { index: 0, picks: Array(qCount).fill(null), finished: false };
    }
    const parsed = JSON.parse(raw) as SessionState;
    if (!Array.isArray(parsed.picks) || parsed.picks.length !== qCount) {
      return { index: 0, picks: Array(qCount).fill(null), finished: false };
    }
    return parsed;
  } catch {
    return { index: 0, picks: Array(qCount).fill(null), finished: false };
  }
}

function saveState(storageKey: string, state: SessionState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export default function PracticeRoundModal({
  round,
  domain,
  triggeredBy,
  storageKey = "practice-round",
  onClose,
}: Props) {
  const [state, setState] = useState<SessionState>(() =>
    loadState(storageKey, round.questions.length),
  );

  useEffect(() => {
    saveState(storageKey, state);
  }, [state, storageKey]);

  // Telemetry on open (fire-and-forget, no DB)
  useEffect(() => {
    try {
      // next-axiom Logger is server-side; in the browser we fall back to a
      // beacon-style POST. Wrap in try/catch — telemetry never breaks UX.
      navigator.sendBeacon?.(
        "/api/practice/telemetry",
        new Blob(
          [
            JSON.stringify({
              event: "practice_round_started",
              domain,
              triggered_by: triggeredBy,
            }),
          ],
          { type: "application/json" },
        ),
      );
    } catch {
      /* noop */
    }
  }, [domain, triggeredBy]);

  const totalCorrect = useMemo(
    () =>
      state.picks.reduce<number>((acc, pick, i) => {
        if (pick == null) return acc;
        const q = round.questions[i];
        return q.choices[pick]?.correct ? acc + 1 : acc;
      }, 0),
    [state.picks, round.questions],
  );

  const attempted = state.picks.filter((p) => p !== null).length;
  const currentQ: PracticeQuestion | undefined = round.questions[state.index];
  const currentPick = currentQ ? state.picks[state.index] : null;

  function handlePick(idx: number) {
    if (state.picks[state.index] !== null) return;
    setState((prev) => {
      const picks = prev.picks.slice();
      picks[prev.index] = idx;
      return { ...prev, picks };
    });
  }

  function handleNext() {
    setState((prev) => {
      if (prev.index + 1 < round.questions.length) {
        return { ...prev, index: prev.index + 1 };
      }
      return { ...prev, finished: true };
    });
  }

  function handleClose() {
    onClose({
      completed: state.finished,
      questionsAttempted: attempted,
      questionsCorrect: totalCorrect,
    });
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        /* noop */
      }
    }
  }

  if (state.finished) {
    return (
      <div
        data-practice-modal="true"
        data-practice-finished="true"
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      >
        <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-6 text-center">
          <div className="text-xs uppercase tracking-widest text-amber-400 mb-2">
            Practice Round · won&rsquo;t be saved
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">
            You got {totalCorrect} / {round.questions.length}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Ready to keep going? You&rsquo;ll return to the card you were on. Nothing
            here was written to your progress.
          </p>
          <button
            type="button"
            data-action="practice-close"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
          >
            Back to my card
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div
      data-practice-modal="true"
      data-practice-domain={domain}
      data-practice-trigger={triggeredBy}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <span
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300 bg-amber-500/10 rounded-full px-3 py-1"
            data-practice-badge="ephemeral"
          >
            Practice Round · won&rsquo;t be saved
          </span>
          <span className="text-xs text-gray-500 tabular-nums">
            {state.index + 1} / {round.questions.length}
          </span>
        </div>

        <div data-practice-question={state.index}>
          <p className="text-base font-medium text-gray-100 mb-4">
            {currentQ.prompt}
          </p>
          <div className="space-y-2">
            {currentQ.choices.map((c, idx) => {
              const picked = currentPick === idx;
              const showExplanation = currentPick !== null;
              const isCorrect = c.correct;
              let style =
                "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300";
              if (showExplanation) {
                if (isCorrect) {
                  style =
                    "border-emerald-500/50 bg-emerald-500/10 text-emerald-200";
                } else if (picked) {
                  style = "border-red-500/50 bg-red-500/10 text-red-300";
                } else {
                  style = "border-gray-800 text-gray-500";
                }
              }
              return (
                <div key={idx}>
                  <button
                    type="button"
                    data-practice-choice={idx}
                    onClick={() => handlePick(idx)}
                    disabled={currentPick !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl border ${style} disabled:cursor-default text-sm transition-colors`}
                  >
                    {c.text}
                  </button>
                  {showExplanation && (
                    <p
                      data-practice-explanation
                      className={`mt-1 text-xs px-4 ${
                        isCorrect ? "text-emerald-300" : "text-gray-400"
                      }`}
                    >
                      {c.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            data-action="practice-skip"
            onClick={handleClose}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Skip practice
          </button>
          {currentPick !== null && (
            <button
              type="button"
              data-action="practice-next"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
            >
              {state.index + 1 < round.questions.length ? "Next" : "See results"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
