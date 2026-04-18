"use client";

import { useState } from "react";
import { splitSections } from "@/lib/split-sections";
import SectionRenderer from "@/components/sections/SectionRenderer";

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
  const [slideIndex, setSlideIndex] = useState(0);

  if (preview) {
    const sections = splitSections(card.body_md ?? "", card.title);
    const section = sections[slideIndex] ?? sections[0];
    const totalSlides = sections.length;

    return (
      <div className="p-5 sm:p-8 max-w-2xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
          {card.domain && (
            <span className="shrink-0 rounded-full bg-amber-500/10 text-amber-400 px-2.5 py-0.5 text-xs font-medium">
              {card.domain}
            </span>
          )}
        </div>

        {card.image_url && slideIndex === 0 && (
          <img src={card.image_url} alt={card.title} className="w-full rounded-lg" />
        )}

        <div style={{ minHeight: 200 }}>
          {section && <SectionRenderer section={section} />}
        </div>

        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {sections.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === slideIndex
                    ? "w-6 h-2 bg-amber-400"
                    : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
                }`}
              />
            ))}
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
