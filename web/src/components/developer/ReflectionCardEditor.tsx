"use client";

import ReflectionCard from "@/components/ReflectionCard";

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
  if (preview) {
    return (
      <div className="p-5 sm:p-8 max-w-2xl mx-auto">
        <ReflectionCard key={card.id} card={card as any} onComplete={() => {}} />
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
