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

interface QuizCardEditorProps {
  card: {
    id: string;
    title: string;
    metadata: {
      questions: Question[];
      pass_threshold: number;
    };
  };
  preview: boolean;
  onChange: (fields: Record<string, any>) => void;
}

export default function QuizCardEditor({
  card,
  preview,
  onChange,
}: QuizCardEditorProps) {
  const { questions, pass_threshold } = card.metadata;

  function updateQuestion(qIdx: number, updates: Partial<Question>) {
    const newQuestions = questions.map((q, i) =>
      i === qIdx ? { ...q, ...updates } : q,
    );
    onChange({ metadata: { ...card.metadata, questions: newQuestions } });
  }

  function updateChoice(qIdx: number, cIdx: number, updates: Partial<Choice>) {
    const newChoices = questions[qIdx].choices.map((c, i) =>
      i === cIdx ? { ...c, ...updates } : c,
    );
    updateQuestion(qIdx, { choices: newChoices });
  }

  function setCorrectChoice(qIdx: number, correctIdx: number) {
    const newChoices = questions[qIdx].choices.map((c, i) => ({
      ...c,
      correct: i === correctIdx,
    }));
    updateQuestion(qIdx, { choices: newChoices });
  }

  function addQuestion() {
    const newQ: Question = {
      prompt: "New question",
      choices: [
        { text: "Option A", correct: true },
        { text: "Option B", correct: false },
        { text: "Option C", correct: false },
        { text: "Option D", correct: false },
      ],
    };
    onChange({
      metadata: { ...card.metadata, questions: [...questions, newQ] },
    });
  }

  function removeQuestion(qIdx: number) {
    onChange({
      metadata: {
        ...card.metadata,
        questions: questions.filter((_, i) => i !== qIdx),
      },
    });
  }

  function addChoice(qIdx: number) {
    const newChoices = [
      ...questions[qIdx].choices,
      { text: "New option", correct: false },
    ];
    updateQuestion(qIdx, { choices: newChoices });
  }

  function removeChoice(qIdx: number, cIdx: number) {
    const newChoices = questions[qIdx].choices.filter((_, i) => i !== cIdx);
    updateQuestion(qIdx, { choices: newChoices });
  }

  const [previewQ, setPreviewQ] = useState(0);
  const [previewSelected, setPreviewSelected] = useState<number | null>(null);

  if (preview) {
    const question = questions[previewQ];
    if (!question) return null;
    const correctIndex = question.choices.findIndex((c) => c.correct);
    const isCorrect = previewSelected === correctIndex;

    return (
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
          <span className="text-sm text-gray-500 bg-gray-800 rounded-full px-2.5 py-0.5">
            {previewQ + 1} / {questions.length}
          </span>
        </div>
        <p className="font-medium text-gray-200">{question.prompt}</p>
        <div className="space-y-2">
          {question.choices.map((choice, idx) => {
            let style =
              "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300";
            if (previewSelected !== null) {
              if (choice.correct) {
                style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
              } else if (idx === previewSelected) {
                style = "border-red-500/50 bg-red-500/10 text-red-300";
              } else {
                style = "border-gray-800 text-gray-500";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => previewSelected === null && setPreviewSelected(idx)}
                disabled={previewSelected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border ${style} disabled:cursor-default transition-colors text-sm`}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
        {previewSelected !== null && !isCorrect && question.choices[previewSelected]?.misconception && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            {question.choices[previewSelected].misconception}
          </p>
        )}
        {previewSelected !== null && (
          <button
            onClick={() => {
              if (previewQ + 1 < questions.length) {
                setPreviewQ((i) => i + 1);
                setPreviewSelected(null);
              } else {
                setPreviewQ(0);
                setPreviewSelected(null);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all text-sm font-medium"
          >
            {previewQ + 1 < questions.length ? "Next Question" : "Restart"}
          </button>
        )}
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

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Pass Threshold
        </label>
        <input
          type="number"
          step="0.05"
          min="0"
          max="1"
          value={pass_threshold}
          onChange={(e) =>
            onChange({
              metadata: {
                ...card.metadata,
                pass_threshold: parseFloat(e.target.value) || 0.7,
              },
            })
          }
          className="w-24 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {questions.map((q, qIdx) => (
        <div
          key={qIdx}
          className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Question {qIdx + 1}
            </span>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(qIdx)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>

          <textarea
            value={q.prompt}
            onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm resize-y focus:outline-none focus:border-amber-500"
            placeholder="Question prompt..."
          />

          <div className="space-y-2">
            {q.choices.map((c, cIdx) => (
              <div key={cIdx} className="flex items-start gap-2">
                <button
                  onClick={() => setCorrectChoice(qIdx, cIdx)}
                  className={`mt-2 w-4 h-4 rounded-full border-2 shrink-0 ${
                    c.correct
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  title={c.correct ? "Correct answer" : "Set as correct"}
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={c.text}
                    onChange={(e) =>
                      updateChoice(qIdx, cIdx, { text: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                  {!c.correct && (
                    <input
                      type="text"
                      value={c.misconception ?? ""}
                      onChange={(e) =>
                        updateChoice(qIdx, cIdx, {
                          misconception: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Misconception explanation (optional)"
                    />
                  )}
                </div>
                {q.choices.length > 2 && (
                  <button
                    onClick={() => removeChoice(qIdx, cIdx)}
                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addChoice(qIdx)}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              + Add choice
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-sm text-gray-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
      >
        + Add question
      </button>
    </div>
  );
}
