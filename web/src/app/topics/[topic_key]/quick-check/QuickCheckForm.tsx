"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  recommendedLevel,
  type AssessmentQuestion,
  type Level,
} from "@/lib/pre-assessment";

interface Props {
  questions: AssessmentQuestion[];
  slugByLevel: Record<string, string>;
  topicKey: string;
}

const LEVEL_FALLBACK: Level[] = ["basic", "intermediate", "advanced"];

function pickSlug(level: Level, slugByLevel: Record<string, string>): string | null {
  if (slugByLevel[level]) return slugByLevel[level];
  // Fallback: walk down the difficulty ladder, then up.
  const idx = LEVEL_FALLBACK.indexOf(level);
  for (let i = idx - 1; i >= 0; i--) {
    if (slugByLevel[LEVEL_FALLBACK[i]]) return slugByLevel[LEVEL_FALLBACK[i]];
  }
  for (let i = idx + 1; i < LEVEL_FALLBACK.length; i++) {
    if (slugByLevel[LEVEL_FALLBACK[i]]) return slugByLevel[LEVEL_FALLBACK[i]];
  }
  return null;
}

export function QuickCheckForm({ questions, slugByLevel, topicKey }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ level: Level; slug: string | null } | null>(
    null,
  );

  const allAnswered = answers.every((a) => a !== null);

  function handleSelect(qIdx: number, choiceIdx: number) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[qIdx] = choiceIdx;
      return next;
    });
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    const level = recommendedLevel(answers as number[]);
    const slug = pickSlug(level, slugByLevel);
    setResult({ level, slug });
    setSubmitting(false);
  }

  function handleStart() {
    if (result?.slug) router.push(`/courses/${result.slug}`);
  }

  if (result) {
    return (
      <div
        data-quick-check="result"
        data-recommended-level={result.level}
        data-topic-key={topicKey}
        className="rounded-2xl border border-amber-500/30 bg-gray-900/60 p-8 text-center"
      >
        <div className="text-xs uppercase tracking-widest text-amber-400 mb-2">
          recommended start
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-3 capitalize">
          {result.level}
        </h2>
        <p className="text-gray-400 mb-6">
          Based on your answers, this is the best place to begin. You can switch
          levels anytime from /browse.
        </p>
        {result.slug ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
          >
            Start the {result.level} course
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            No course at this level is published yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questions.map((q, qIdx) => (
        <fieldset
          key={qIdx}
          data-question-index={qIdx}
          className="rounded-xl border border-gray-800 bg-gray-900/40 p-5"
        >
          <legend className="text-sm font-semibold text-gray-200 px-2">
            {qIdx + 1}. {q.prompt}
          </legend>
          <div className="mt-3 space-y-2">
            {q.choices.map((choice, cIdx) => {
              const checked = answers[qIdx] === cIdx;
              return (
                <label
                  key={cIdx}
                  data-choice-index={cIdx}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    checked
                      ? "bg-amber-500/10 border border-amber-500/30"
                      : "border border-gray-800 hover:bg-gray-800/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${qIdx}`}
                    checked={checked}
                    onChange={() => handleSelect(qIdx, cIdx)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-200">{choice.text}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="pt-2">
        <button
          type="button"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
          className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Scoring…" : "Find my level"}
        </button>
      </div>
    </div>
  );
}
