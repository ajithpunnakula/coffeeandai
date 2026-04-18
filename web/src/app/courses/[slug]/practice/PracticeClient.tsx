"use client";

import { useState } from "react";
import Link from "next/link";

interface Choice {
  text: string;
  correct: boolean;
  misconception?: string;
}

interface Question {
  prompt: string;
  objective?: string;
  choices: Choice[];
}

interface PracticeClientProps {
  courseSlug: string;
  courseTitle: string;
  weakConcepts: string[];
}

export default function PracticeClient({
  courseSlug,
  courseTitle,
  weakConcepts,
}: PracticeClientProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [concepts, setConcepts] = useState<string[]>([]);

  async function generateQuestions() {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);

    try {
      const resp = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        setError(data.error ?? "Failed to generate questions");
        return;
      }

      const data = await resp.json();
      setQuestions(data.questions);
      setConcepts(data.concepts ?? []);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (questions[currentQ].choices[idx].correct) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((i) => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  // Landing state — no questions yet
  if (questions.length === 0 && !loading) {
    return (
      <main className="flex-1 pt-6 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to course
          </Link>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Practice Mode</h1>
              <p className="text-gray-400 text-sm mt-1">{courseTitle}</p>
            </div>

            {weakConcepts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  We&apos;ll generate fresh questions targeting your weak areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {weakConcepts.map((concept) => (
                    <span
                      key={concept}
                      className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-3 py-1"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Complete more cards to identify your weak areas. We&apos;ll generate targeted practice questions based on your performance.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              onClick={generateQuestions}
              disabled={weakConcepts.length === 0}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Practice Questions
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (loading) {
    return (
      <main className="flex-1 pt-6 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-center space-y-4">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Generating practice questions...</p>
          </div>
        </div>
      </main>
    );
  }

  // Finished state
  if (finished) {
    const score = correctCount / questions.length;
    const passed = score >= 0.7;
    return (
      <main className="flex-1 pt-6 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 sm:p-8 space-y-5 text-center">
            <h2 className="text-xl font-bold text-gray-100">Practice Complete</h2>
            {concepts.length > 0 && (
              <p className="text-sm text-gray-500">
                Topics: {concepts.join(", ")}
              </p>
            )}
            <p className="text-4xl font-bold text-gray-100">
              {correctCount} / {questions.length}
            </p>
            <p className={passed ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
              {passed ? "Great job!" : "Keep practicing to strengthen these concepts."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={generateQuestions}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all text-sm"
              >
                Practice Again
              </button>
              <Link
                href={`/courses/${courseSlug}/play`}
                className="px-6 py-3 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all text-sm"
              >
                Back to Course
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Quiz in progress
  const question = questions[currentQ];
  const correctIndex = question.choices.findIndex((c) => c.correct);
  const isCorrect = selected === correctIndex;

  return (
    <main className="flex-1 pt-6 px-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <div className="p-5 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-100">Practice</h2>
              <span className="text-sm text-gray-500 bg-gray-800 rounded-full px-2.5 py-0.5">
                {currentQ + 1} / {questions.length}
              </span>
            </div>

            <p className="font-medium text-gray-200">{question.prompt}</p>

            <div className="space-y-2">
              {question.choices.map((choice, idx) => {
                let style =
                  "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300";
                if (selected !== null) {
                  if (choice.correct) {
                    style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                  } else if (idx === selected) {
                    style = "border-red-500/50 bg-red-500/10 text-red-300";
                  } else {
                    style = "border-gray-800 text-gray-500";
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={selected !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl border ${style} disabled:cursor-default transition-colors text-sm`}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>

            {selected !== null && !isCorrect && question.choices[selected]?.misconception && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {question.choices[selected].misconception}
              </p>
            )}

            {selected !== null && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all text-sm font-medium"
              >
                {currentQ + 1 < questions.length ? "Next Question" : "See Results"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
