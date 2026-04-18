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

interface ScenarioCardEditorProps {
  card: {
    id: string;
    title: string;
    metadata: { steps: Step[] };
  };
  preview: boolean;
  onChange: (fields: Record<string, any>) => void;
}

export default function ScenarioCardEditor({
  card,
  preview,
  onChange,
}: ScenarioCardEditorProps) {
  const { steps } = card.metadata;

  function updateStep(idx: number, updates: Partial<Step>) {
    const newSteps = steps.map((s, i) =>
      i === idx ? { ...s, ...updates } : s,
    );
    onChange({ metadata: { steps: newSteps } });
  }

  function updateChoice(
    stepIdx: number,
    choiceIdx: number,
    updates: Partial<Choice>,
  ) {
    const step = steps[stepIdx];
    const newChoices = (step.choices ?? []).map((c, i) =>
      i === choiceIdx ? { ...c, ...updates } : c,
    );
    updateStep(stepIdx, { choices: newChoices });
  }

  function addStep() {
    const id = `step_${Date.now()}`;
    const newStep: Step = {
      id,
      situation: "Describe the situation",
      choices: [
        { text: "Choice A", next: "", score: 1 },
        { text: "Choice B", next: "", score: 0 },
      ],
    };
    onChange({ metadata: { steps: [...steps, newStep] } });
  }

  function removeStep(idx: number) {
    onChange({ metadata: { steps: steps.filter((_, i) => i !== idx) } });
  }

  function addChoice(stepIdx: number) {
    const step = steps[stepIdx];
    const newChoices = [
      ...(step.choices ?? []),
      { text: "New choice", next: "", score: 0 },
    ];
    updateStep(stepIdx, { choices: newChoices });
  }

  function removeChoice(stepIdx: number, choiceIdx: number) {
    const step = steps[stepIdx];
    const newChoices = (step.choices ?? []).filter((_, i) => i !== choiceIdx);
    updateStep(stepIdx, { choices: newChoices });
  }

  const stepMap = new Map(steps.map((s) => [s.id, s]));
  const [previewStepId, setPreviewStepId] = useState("start");
  const [previewScores, setPreviewScores] = useState<number[]>([]);
  const [previewFinished, setPreviewFinished] = useState(false);

  if (preview) {
    const currentStep = stepMap.get(previewStepId);
    if (!currentStep) {
      return (
        <div className="p-4 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-100 mb-4">{card.title}</h2>
          <p className="text-red-400 text-sm">Step &quot;{previewStepId}&quot; not found. Check step IDs.</p>
          <button
            onClick={() => { setPreviewStepId("start"); setPreviewScores([]); setPreviewFinished(false); }}
            className="mt-3 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-sm hover:bg-gray-700"
          >
            Restart
          </button>
        </div>
      );
    }

    if (previewFinished && currentStep.outcome) {
      const avg = previewScores.length > 0 ? previewScores.reduce((a, b) => a + b, 0) / previewScores.length : 0;
      return (
        <div className="space-y-4 p-4 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <p className="font-medium text-amber-400 text-sm mb-1">Outcome</p>
            <p className="text-gray-200">{currentStep.outcome}</p>
          </div>
          <p className="text-sm text-gray-500">Path score: {avg.toFixed(2)}</p>
          <button
            onClick={() => { setPreviewStepId("start"); setPreviewScores([]); setPreviewFinished(false); }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all text-sm font-medium"
          >
            Restart
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
        <p className="text-gray-300">{currentStep.situation}</p>
        <div className="space-y-2">
          {currentStep.choices?.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newScores = [...previewScores, choice.score];
                const nextStep = stepMap.get(choice.next);
                setPreviewScores(newScores);
                setPreviewStepId(choice.next);
                if (nextStep?.outcome) {
                  setPreviewFinished(true);
                }
              }}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-700 hover:border-amber-500/50 hover:bg-amber-500/5 text-gray-300 hover:text-gray-100 transition-colors text-sm"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={card.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {steps.map((step, sIdx) => (
        <div
          key={step.id}
          className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                Step: {step.id}
              </span>
              {step.outcome && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 rounded px-1.5">
                  Outcome
                </span>
              )}
            </div>
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(sIdx)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Step ID</label>
            <input
              type="text"
              value={step.id}
              onChange={(e) => updateStep(sIdx, { id: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Situation
            </label>
            <textarea
              value={step.situation}
              onChange={(e) =>
                updateStep(sIdx, { situation: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm resize-y focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Outcome (leave empty for decision steps)
            </label>
            <input
              type="text"
              value={step.outcome ?? ""}
              onChange={(e) =>
                updateStep(sIdx, {
                  outcome: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              placeholder="End-state description"
            />
          </div>

          {!step.outcome && (
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Choices</span>
              {(step.choices ?? []).map((c, cIdx) => (
                <div key={cIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) =>
                      updateChoice(sIdx, cIdx, { text: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Choice text"
                  />
                  <input
                    type="text"
                    value={c.next}
                    onChange={(e) =>
                      updateChoice(sIdx, cIdx, { next: e.target.value })
                    }
                    className="w-24 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-xs focus:outline-none focus:border-amber-500"
                    placeholder="next ID"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={c.score}
                    onChange={(e) =>
                      updateChoice(sIdx, cIdx, {
                        score: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-16 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-xs focus:outline-none focus:border-amber-500"
                    title="Score"
                  />
                  {(step.choices ?? []).length > 1 && (
                    <button
                      onClick={() => removeChoice(sIdx, cIdx)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addChoice(sIdx)}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                + Add choice
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addStep}
        className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-sm text-gray-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
      >
        + Add step
      </button>
    </div>
  );
}
