"use client";

import { useState } from "react";
import PracticeRoundModal from "@/components/PracticeRoundModal";
import type { PracticeRound } from "@/lib/practice-generator";

const SEED_ROUND: PracticeRound = {
  questions: [
    {
      prompt: "When designing a tool schema for an LLM, what matters most?",
      choices: [
        {
          text: "Strict JSON schema with descriptive field names.",
          correct: true,
          explanation:
            "Strict schemas + descriptive names give the model the structure it needs to call tools reliably.",
        },
        {
          text: "Free-form string fields with examples in the description.",
          correct: false,
          explanation:
            "Free-form strings invite drift; the model produces valid tool calls less consistently.",
        },
        {
          text: "Maximum nesting and minimal documentation.",
          correct: false,
          explanation:
            "Deep nesting hurts reliability; the model gets lost in long-distance dependencies.",
        },
        {
          text: "Whatever the SDK gives you.",
          correct: false,
          explanation:
            "SDK defaults aren't always optimized for the task. Tune the schema to the use case.",
        },
      ],
    },
    {
      prompt: "Which is the safer fallback when a tool call fails to parse?",
      choices: [
        {
          text: "Echo the schema back to the model and request a retry.",
          correct: true,
          explanation:
            "A targeted retry with the schema gives the model the cue it needs to self-correct.",
        },
        {
          text: "Crash the request with a 5xx.",
          correct: false,
          explanation: "User-visible errors should be the last resort.",
        },
        {
          text: "Silently drop the call.",
          correct: false,
          explanation: "Silently dropping makes debugging extremely hard.",
        },
        {
          text: "Disable the tool permanently.",
          correct: false,
          explanation: "One bad call is not signal enough to disable a tool.",
        },
      ],
    },
    {
      prompt:
        "What's a sign that a tool's description is hurting model performance?",
      choices: [
        {
          text: "The model picks the tool when not appropriate, or vice versa.",
          correct: true,
          explanation:
            "Mis-targeted tool calls usually trace back to fuzzy descriptions.",
        },
        {
          text: "The model gets the right tool every time.",
          correct: false,
          explanation: "That's a sign the description is working.",
        },
        {
          text: "The model never calls the tool.",
          correct: false,
          explanation:
            "Could be a description problem — but more often the task simply doesn't need it.",
        },
        {
          text: "The latency is high.",
          correct: false,
          explanation:
            "Latency is mostly tool execution, not description quality.",
        },
      ],
    },
  ],
};

export default function PracticePreviewClient() {
  const [open, setOpen] = useState(true);
  const [result, setResult] = useState<{
    completed: boolean;
    questionsAttempted: number;
    questionsCorrect: number;
  } | null>(null);

  if (open) {
    return (
      <PracticeRoundModal
        round={SEED_ROUND}
        domain="Tool Design"
        triggeredBy="manual"
        storageKey="practice-preview"
        onClose={(r) => {
          setResult(r);
          setOpen(false);
        }}
      />
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-100 mb-3">
        Preview closed
      </h1>
      {result && (
        <p className="text-sm text-gray-400 mb-4" data-preview-result>
          Attempted {result.questionsAttempted}, correct {result.questionsCorrect}.
          Nothing was saved.
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
      >
        Reopen preview
      </button>
    </main>
  );
}
