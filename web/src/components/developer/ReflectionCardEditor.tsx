"use client";

import { useState } from "react";

interface ReflectionCardEditorProps {
  card: {
    id: string;
    title: string;
    metadata: { prompt: string };
  };
  preview: boolean;
  onChange: (fields: Record<string, any>) => void;
}

export default function ReflectionCardEditor({
  card,
  preview,
  onChange,
}: ReflectionCardEditorProps) {
  const [previewText, setPreviewText] = useState("");
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  if (preview) {
    return (
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
        <p className="text-gray-300">{card.metadata.prompt}</p>
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          disabled={previewSubmitted}
          placeholder="Write your reflection here..."
          className="w-full h-40 p-3 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 disabled:bg-gray-800/50 disabled:text-gray-400"
        />
        {!previewSubmitted ? (
          <button
            onClick={() => setPreviewSubmitted(true)}
            disabled={previewText.trim().length < 20}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            Submit
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-emerald-400 font-medium text-sm">Reflection submitted.</p>
            <button
              onClick={() => { setPreviewText(""); setPreviewSubmitted(false); }}
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
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
          Reflection Prompt
        </label>
        <textarea
          value={card.metadata.prompt}
          onChange={(e) =>
            onChange({ metadata: { prompt: e.target.value } })
          }
          rows={6}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm resize-y focus:outline-none focus:border-amber-500"
          placeholder="What should the learner reflect on?"
        />
      </div>
    </div>
  );
}
