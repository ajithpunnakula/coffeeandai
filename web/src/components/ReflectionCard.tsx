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
      <h2 className="text-xl font-bold">{card.title}</h2>
      <p>{card.metadata.prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        placeholder="Write your reflection here..."
        className="w-full h-40 p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg resize-y disabled:bg-gray-50 dark:disabled:bg-gray-800"
      />
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 20}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      ) : (
        <p className="text-green-600 font-medium">Reflection submitted.</p>
      )}
    </div>
  );
}
