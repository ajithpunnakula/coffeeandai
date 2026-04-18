"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import CardList from "./CardList";
import CardEditor from "./CardEditor";
import MetadataPanel from "./MetadataPanel";
import AIChatPanel from "./AIChatPanel";

interface Card {
  id: string;
  title: string;
  card_type: string;
  ord: number;
  body_md: string | null;
  domain: string | null;
  difficulty: number | null;
  metadata: any;
  image_url: string | null;
  audio_url: string | null;
  updated_at: string;
}

interface Course {
  slug: string;
  title: string;
  summary: string | null;
  domains: any;
  estimated_minutes: number | null;
  pass_threshold: number | null;
  exam_target: string | null;
  target_audience: string | null;
  tags: string[] | null;
  card_order: string[];
  cards: Card[];
}

interface CourseEditorProps {
  initialCourse: Course;
}

type SaveStatus = "saved" | "saving" | "dirty" | "error";

export default function CourseEditor({ initialCourse }: CourseEditorProps) {
  const [course, setCourse] = useState(initialCourse);
  const [cards, setCards] = useState<Card[]>(initialCourse.cards ?? []);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    cards[0]?.id ?? null,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [preview, setPreview] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyCards = useRef<Set<string>>(new Set());
  const dirtyCourse = useRef(false);

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  // Sort cards by card_order
  const sortedCards = course.card_order?.length
    ? course.card_order
        .map((id) => cards.find((c) => c.id === id))
        .filter((c): c is Card => c != null)
    : cards;

  // Debounced auto-save
  const scheduleSave = useCallback(() => {
    setSaveStatus("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => flushSave(), 500);
  }, []);

  async function flushSave() {
    setSaveStatus("saving");
    try {
      // Save dirty cards
      const cardIds = Array.from(dirtyCards.current);
      dirtyCards.current.clear();

      await Promise.all(
        cardIds.map(async (cardId) => {
          const card = cards.find((c) => c.id === cardId);
          if (!card) return;
          const res = await fetch(`/api/developer/cards/${cardId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: card.title,
              body_md: card.body_md,
              card_type: card.card_type,
              difficulty: card.difficulty,
              domain: card.domain,
              metadata:
                typeof card.metadata === "string"
                  ? card.metadata
                  : JSON.stringify(card.metadata),
              image_url: card.image_url,
              audio_url: card.audio_url,
            }),
          });
          if (!res.ok) throw new Error("Failed to save card");
        }),
      );

      // Save course metadata if dirty
      if (dirtyCourse.current) {
        dirtyCourse.current = false;
        const res = await fetch(`/api/developer/courses/${course.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: course.title,
            summary: course.summary,
            estimated_minutes: course.estimated_minutes,
            pass_threshold: course.pass_threshold,
            exam_target: course.exam_target,
            target_audience: course.target_audience,
            domains: course.domains,
            tags: course.tags,
          }),
        });
        if (!res.ok) throw new Error("Failed to save course");
      }

      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  function handleCardChange(fields: Record<string, any>) {
    if (!selectedCardId) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === selectedCardId ? { ...c, ...fields } : c,
      ),
    );
    dirtyCards.current.add(selectedCardId);
    scheduleSave();
  }

  function handleCourseChange(fields: Record<string, any>) {
    setCourse((prev) => ({ ...prev, ...fields }));
    dirtyCourse.current = true;
    scheduleSave();
  }

  async function handleAddCard(type: string) {
    const title = `New ${type.charAt(0).toUpperCase() + type.slice(1)} Card`;
    const res = await fetch("/api/developer/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: course.slug,
        cardType: type,
        title,
        ord: cards.length,
      }),
    });
    if (!res.ok) return;
    const newCard = await res.json();
    setCards((prev) => [...prev, newCard]);
    setCourse((prev) => ({
      ...prev,
      card_order: [...(prev.card_order ?? []), newCard.id],
    }));
    setSelectedCardId(newCard.id);
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm("Delete this card?")) return;
    const res = await fetch(`/api/developer/cards/${cardId}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setCourse((prev) => ({
      ...prev,
      card_order: (prev.card_order ?? []).filter((id) => id !== cardId),
    }));
    if (selectedCardId === cardId) {
      setSelectedCardId(cards[0]?.id ?? null);
    }
  }

  async function handleReorder(newOrder: string[]) {
    setCourse((prev) => ({ ...prev, card_order: newOrder }));
    await fetch("/api/developer/cards/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: course.slug,
        cardOrder: newOrder,
      }),
    });
  }

  const statusText: Record<SaveStatus, string> = {
    saved: "Saved",
    saving: "Saving...",
    dirty: "Unsaved changes",
    error: "Save failed",
  };

  const statusColor: Record<SaveStatus, string> = {
    saved: "text-emerald-400",
    saving: "text-amber-400",
    dirty: "text-amber-400",
    error: "text-red-400",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <Link
            href="/developer"
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-100 truncate max-w-md">
            {course.title}
          </h1>
          <span className={`text-xs ${statusColor[saveStatus]}`}>
            {statusText[saveStatus]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showMetadata
                ? "bg-amber-500/10 text-amber-400"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setPreview(!preview)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              preview
                ? "bg-amber-500/10 text-amber-400"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Card List Sidebar */}
        <div className="w-64 border-r border-gray-800 bg-gray-900/30 overflow-hidden flex flex-col shrink-0">
          <CardList
            cards={sortedCards}
            selectedId={selectedCardId}
            onSelect={setSelectedCardId}
            onAdd={handleAddCard}
            onDelete={handleDeleteCard}
            onReorder={handleReorder}
          />
        </div>

        {/* Main Editor / Preview */}
        <div className={`flex-1 overflow-y-auto ${aiPanelOpen ? "mr-96" : ""}`}>
          {showMetadata ? (
            <MetadataPanel course={course} onChange={handleCourseChange} />
          ) : (
            <CardEditor
              card={selectedCard}
              preview={preview}
              onChange={handleCardChange}
            />
          )}
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel
        courseSlug={course.slug}
        currentCard={selectedCard}
        open={aiPanelOpen}
        onToggle={() => setAiPanelOpen(!aiPanelOpen)}
      />
    </div>
  );
}
