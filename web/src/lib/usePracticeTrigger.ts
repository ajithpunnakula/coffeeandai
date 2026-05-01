"use client";

import { useCallback, useRef, useState } from "react";
import {
  evaluatePracticeTrigger,
  type AnswerEvent,
  type TriggerEvaluation,
  type TriggerReason,
} from "./practice-trigger";

const HISTORY_KEY = "practice-trigger:history";
const SUPPRESS_DOMAIN_KEY = "practice-trigger:suppressed-domains";
const SESSION_DONT_ASK_KEY = "practice-trigger:session-dont-ask";

interface UsePracticeTriggerResult {
  history: AnswerEvent[];
  recordAnswer: (event: AnswerEvent) => TriggerEvaluation;
  triggerManually: (domain: string) => TriggerEvaluation;
  suppressDomain: (domain: string) => void;
  setSessionDontAsk: (v: boolean) => void;
  evaluation: TriggerEvaluation;
  clearEvaluation: () => void;
}

function readSessionJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeSessionJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function usePracticeTrigger(): UsePracticeTriggerResult {
  // Lazy init reads sessionStorage on first render in the browser. The hook
  // is "use client" so SSR never executes this body.
  const [history, setHistory] = useState<AnswerEvent[]>(() =>
    readSessionJson<AnswerEvent[]>(HISTORY_KEY, []),
  );
  const [evaluation, setEvaluation] = useState<TriggerEvaluation>({
    shouldTrigger: false,
    reason: null,
    domain: null,
  });
  const suppressedRef = useRef<Set<string>>(
    new Set(readSessionJson<string[]>(SUPPRESS_DOMAIN_KEY, [])),
  );
  const dontAskRef = useRef<boolean>(
    readSessionJson<boolean>(SESSION_DONT_ASK_KEY, false),
  );

  const recordAnswer = useCallback(
    (event: AnswerEvent): TriggerEvaluation => {
      const next = [...history, event];
      setHistory(next);
      writeSessionJson(HISTORY_KEY, next);
      const ev = evaluatePracticeTrigger(next, {
        suppressedDomains: suppressedRef.current,
        sessionDontAskAgain: dontAskRef.current,
      });
      if (ev.shouldTrigger) setEvaluation(ev);
      return ev;
    },
    [history],
  );

  const triggerManually = useCallback(
    (domain: string): TriggerEvaluation => {
      const ev: TriggerEvaluation = {
        shouldTrigger: true,
        reason: "manual" as TriggerReason,
        domain,
      };
      setEvaluation(ev);
      return ev;
    },
    [],
  );

  const suppressDomain = useCallback((domain: string) => {
    suppressedRef.current.add(domain);
    writeSessionJson(
      SUPPRESS_DOMAIN_KEY,
      Array.from(suppressedRef.current),
    );
  }, []);

  const setSessionDontAsk = useCallback((v: boolean) => {
    dontAskRef.current = v;
    writeSessionJson(SESSION_DONT_ASK_KEY, v);
  }, []);

  const clearEvaluation = useCallback(() => {
    setEvaluation({
      shouldTrigger: false,
      reason: null,
      domain: null,
    });
  }, []);

  return {
    history,
    recordAnswer,
    triggerManually,
    suppressDomain,
    setSessionDontAsk,
    evaluation,
    clearEvaluation,
  };
}
