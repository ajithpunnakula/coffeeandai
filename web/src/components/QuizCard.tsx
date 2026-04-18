"use client";

import { useState } from "react";

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
      const finalCorrect = correctCount + (selected === correctIndex ? 0 : 0);
      const score = finalCorrect / questions.length;
      if (score >= pass_threshold) {
        onComplete(score);
      }
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
        <h2 className="text-xl font-bold">{card.title}</h2>
        <p className="text-lg">
          Score: {correctCount} / {questions.length}
        </p>
        <p className={passed ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {passed ? "Passed!" : `Need ${Math.round(pass_threshold * 100)}% to pass. Try again.`}
        </p>
        {!passed && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <h2 className="text-xl font-bold">{card.title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      <p className="font-medium">{question.prompt}</p>

      <div className="space-y-2">
        {question.choices.map((choice, idx) => {
          let style = "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800";
          if (selected !== null) {
            if (choice.correct) {
              style = "border-green-500 bg-green-50 dark:bg-green-950";
            } else if (idx === selected) {
              style = "border-red-500 bg-red-50 dark:bg-red-950";
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-2 rounded border ${style} disabled:cursor-default`}
            >
              {choice.text}
            </button>
          );
        })}
      </div>

      {selected !== null && !isCorrect && question.choices[selected]?.misconception && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded">
          {question.choices[selected].misconception}
        </p>
      )}

      {selected !== null && (
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {currentQ + 1 < questions.length ? "Next Question" : "See Results"}
        </button>
      )}
    </div>
  );
}
