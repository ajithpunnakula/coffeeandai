"use client";

import { useState } from "react";
import ExtraPracticeButton from "./ExtraPracticeButton";

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
        <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <p className="font-medium text-amber-400 text-sm mb-1">Outcome</p>
          <p className="text-gray-200">{step.outcome}</p>
        </div>
        <p className="text-sm text-gray-500">
          Path score: {(Math.round(avg * 100) / 100).toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
      <p className="text-gray-300">{step.situation}</p>
      <div className="space-y-2">
        {step.choices?.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(choice)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-700 hover:border-amber-500/50 hover:bg-amber-500/5 text-gray-300 hover:text-gray-100 transition-colors text-sm"
          >
            {choice.text}
          </button>
        ))}
      </div>
      <div className="pt-2 border-t border-gray-800/60">
        <ExtraPracticeButton domain={card.domain} cardTitle={card.title} />
      </div>
    </div>
  );
}
