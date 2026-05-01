"use client";

import { useState } from "react";
import ExtraPracticeButton from "./ExtraPracticeButton";

interface Choice {
  text: string;
  correct: boolean;
  misconception?: string;
}

interface Question {
  prompt: string;
  choices: Choice[];
  objective?: string;
}

interface QuizCardProps {
  card: {
    id: string;
    title: string;
    domain: string;
    difficulty: number;
    metadata: {
      questions: Question[];
      pass_threshold: number;
    };
  };
  onComplete: (score: number) => void;
}

export default function QuizCard({ card, onComplete }: QuizCardProps) {
  const { questions, pass_threshold } = card.metadata;
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQ];
  const correctIndex = question?.choices.findIndex((c) => c.correct);
  const isCorrect = selected === correctIndex;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (question.choices[idx].correct) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((i) => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
      // correctCount already includes the last answer (incremented by handleSelect)
      const score = correctCount / questions.length;
      onComplete(score);
    }
  }

  function handleRetry() {
    setCurrentQ(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    const score = correctCount / questions.length;
    const passed = score >= pass_threshold;
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
        <p className="text-3xl font-bold">
          {correctCount} / {questions.length}
        </p>
        <p className={passed ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
          {passed ? "Passed!" : `Need ${Math.round(pass_threshold * 100)}% to pass. Try again.`}
        </p>
        {!passed && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
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

      <div className="pt-2 border-t border-gray-800/60">
        <ExtraPracticeButton domain={card.domain} cardTitle={card.title} />
      </div>
    </div>
  );
}
