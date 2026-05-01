"use client";

import { useState } from "react";

const TYPE_ICONS: Record<string, string> = {
  page: "📄",
  quiz: "❓",
  scenario: "🎭",
  reflection: "💭",
};

const CARD_TYPES = ["page", "quiz", "scenario", "reflection"];

interface Card {
  id: string;
  title: string;
  card_type: string;
  ord: number;
}

interface CardListProps {
  cards: Card[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: string) => void;
  onDelete: (id: string) => void;
  onReorder: (cardIds: string[]) => void;
}

export default function CardList({
  cards,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: CardListProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    const newCards = [...cards];
    const [moved] = newCards.splice(dragIdx, 1);
    newCards.splice(idx, 0, moved);
    onReorder(newCards.map((c) => c.id));
    setDragIdx(idx);
  }

  function handleDragEnd() {
    setDragIdx(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cards ({cards.length})
          </span>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              + Add
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-6 z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                {CARD_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      onAdd(type);
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                  >
                    {TYPE_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(card.id)}
            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-l-2 transition-colors ${
              selectedId === card.id
                ? "border-amber-500 bg-amber-500/5 text-gray-100"
                : "border-transparent hover:bg-gray-800/50 text-gray-400"
            }`}
          >
            <span className="text-sm cursor-grab" title="Drag to reorder">
              {TYPE_ICONS[card.card_type] ?? "📄"}
            </span>
            <span className="flex-1 text-sm truncate">{card.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-opacity"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
