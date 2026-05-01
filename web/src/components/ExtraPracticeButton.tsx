"use client";

import { useState } from "react";
import PracticeRoundModal from "./PracticeRoundModal";
import type { PracticeRound } from "@/lib/practice-generator";

interface Props {
  domain: string;
  level?: string;
  cardTitle?: string;
}

export default function ExtraPracticeButton({
  domain,
  level = "intermediate",
  cardTitle,
}: Props) {
  const [round, setRound] = useState<PracticeRound | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          level,
          missedConcepts: cardTitle
            ? [
                {
                  cardTitle,
                  correctAnswer: "(see card explanation)",
                  learnerPick: "(self-requested practice)",
                },
              ]
            : [],
        }),
      });
      if (!res.ok) {
        setError(`Practice unavailable (${res.status})`);
        return;
      }
      const data = (await res.json()) as PracticeRound;
      setRound(data);
    } catch {
      setError("Practice unavailable");
    } finally {
      setLoading(false);
    }
  }

  if (round) {
    return (
      <PracticeRoundModal
        round={round}
        domain={domain}
        triggeredBy="manual"
        storageKey={`practice-${domain}`}
        onClose={() => setRound(null)}
      />
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        data-action="extra-practice"
        onClick={start}
        disabled={loading}
        className="text-xs text-amber-300 hover:text-amber-200 underline-offset-4 hover:underline disabled:opacity-50"
      >
        {loading ? "Generating practice…" : "I'm struggling — extra practice"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
