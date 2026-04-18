"use client";

import { useState } from "react";

interface Choice {
  text: string;
  next: string;
  score: number;
}

interface Step {
  id: string;
  situation: string;
  choices?: Choice[];
  outcome?: string;
}

interface ScenarioCardProps {
  card: {
    id: string;
    title: string;
    domain: string;
    difficulty: number;
    metadata: {
      steps: Step[];
    };
  };
  onComplete: (score: number) => void;
}

export default function ScenarioCard({ card, onComplete }: ScenarioCardProps) {
  const { steps } = card.metadata;
  const stepMap = new Map(steps.map((s) => [s.id, s]));

  const [currentStepId, setCurrentStepId] = useState("start");
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const step = stepMap.get(currentStepId);
  if (!step) return <p>Error: step not found.</p>;

  function handleChoice(choice: Choice) {
    const newScores = [...scores, choice.score];
    const nextStep = stepMap.get(choice.next);

    if (nextStep?.outcome) {
      setScores(newScores);
      setCurrentStepId(choice.next);
      setFinished(true);
      const avg = newScores.reduce((a, b) => a + b, 0) / newScores.length;
      onComplete(Math.round(avg * 100) / 100);
    } else {
      setScores(newScores);
      setCurrentStepId(choice.next);
    }
  }

  if (finished && step.outcome) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{card.title}</h2>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-medium">Outcome</p>
          <p className="mt-1">{step.outcome}</p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Path score: {(Math.round(avg * 100) / 100).toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{card.title}</h2>
      <p>{step.situation}</p>
      <div className="space-y-2">
        {step.choices?.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(choice)}
            className="w-full text-left px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
