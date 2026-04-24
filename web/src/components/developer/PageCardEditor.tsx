"use client";

import PageCard from "@/components/PageCard";

interface PageCardEditorProps {
  card: {
    id: string;
    title: string;
    body_md: string | null;
    domain: string | null;
    difficulty: number | null;
    image_url: string | null;
    audio_url: string | null;
  };
  preview: boolean;
  onChange: (fields: Record<string, any>) => void;
}

export default function PageCardEditor({
  card,
  preview,
  onChange,
}: PageCardEditorProps) {
  if (preview) {
    return (
      <div className="p-5 sm:p-8 max-w-2xl mx-auto">
        <PageCard
          key={card.id}
          card={{
            id: card.id,
            title: card.title,
            body_md: card.body_md ?? "",
            domain: card.domain ?? "",
            difficulty: card.difficulty ?? 0,
            image_url: card.image_url ?? undefined,
            audio_url: card.audio_url ?? undefined,
          }}
        />
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Domain</label>
          <input
            type="text"
            value={card.domain ?? ""}
            onChange={(e) => onChange({ domain: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Difficulty (0-3)
          </label>
          <input
            type="number"
            min="0"
            max="3"
            value={card.difficulty ?? 0}
            onChange={(e) =>
              onChange({ difficulty: parseInt(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Body (Markdown)
        </label>
        <textarea
          value={card.body_md ?? ""}
          onChange={(e) => onChange({ body_md: e.target.value })}
          rows={16}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm font-mono resize-y focus:outline-none focus:border-amber-500"
          placeholder="Write card content in Markdown..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Image URL</label>
          <input
            type="text"
            value={card.image_url ?? ""}
            onChange={(e) => onChange({ image_url: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Audio URL</label>
          <input
            type="text"
            value={card.audio_url ?? ""}
            onChange={(e) => onChange({ audio_url: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}
