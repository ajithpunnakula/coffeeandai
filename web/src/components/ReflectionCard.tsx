"use client";

import { useState } from "react";

interface ReflectionCardProps {
  card: {
    id: string;
    title: string;
    domain: string;
    difficulty: number;
    metadata: {
      prompt: string;
    };
  };
  onComplete: () => void;
}

export default function ReflectionCard({ card, onComplete }: ReflectionCardProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(true);
    onComplete();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
      <p className="text-gray-300">{card.metadata.prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        placeholder="Write your reflection here..."
        className="w-full h-40 p-3 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 disabled:bg-gray-800/50 disabled:text-gray-400"
      />
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 20}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          Submit
        </button>
      ) : (
        <p className="text-emerald-400 font-medium text-sm">Reflection submitted.</p>
      )}
    </div>
  );
}
