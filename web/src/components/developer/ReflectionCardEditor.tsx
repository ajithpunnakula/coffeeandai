"use client";

interface ReflectionCardEditorProps {
  card: {
    id: string;
    title: string;
    metadata: { prompt: string };
  };
  onChange: (fields: Record<string, any>) => void;
}

export default function ReflectionCardEditor({
  card,
  onChange,
}: ReflectionCardEditorProps) {
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
