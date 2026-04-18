"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageCard from "./PageCard";
import QuizCard from "./QuizCard";
import ScenarioCard from "./ScenarioCard";
import ReflectionCard from "./ReflectionCard";
import TutorPanel from "./TutorPanel";

interface CardPlayerProps {
  cards: any[];
  courseSlug: string;
}

export default function CardPlayer({ cards, courseSlug }: CardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());

  const card = cards[currentIndex];
  const total = cards.length;
  const canGoNext =
    currentIndex < total - 1 &&
    (card.card_type === "page" || completedCards.has(card.id));

  const postProgress = useCallback(
    async (cardId: string, status: string, score?: number) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId, status, score, courseSlug }),
        });
      } catch {
        // fail silently
      }
    },
    [courseSlug],
  );

  useEffect(() => {
    if (card) {
      postProgress(card.id, "viewed");
    }
  }, [card, postProgress]);

  function handleComplete(score?: number) {
    setCompletedCards((prev) => new Set(prev).add(card.id));
    postProgress(card.id, "completed", score);
  }

  function renderCard() {
    switch (card.card_type) {
      case "page":
        return <PageCard card={card} />;
      case "quiz":
        return (
          <QuizCard
            key={card.id}
            card={card}
            onComplete={(score) => handleComplete(score)}
          />
        );
      case "scenario":
        return (
          <ScenarioCard
            key={card.id}
            card={card}
            onComplete={(score) => handleComplete(score)}
          />
        );
      case "reflection":
        return (
          <ReflectionCard
            key={card.id}
            card={card}
            onComplete={() => handleComplete()}
          />
        );
      default:
        return <p>Unknown card type: {card.card_type}</p>;
    }
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span className="font-medium text-gray-400">
            Card {currentIndex + 1} of {total}
          </span>
          <span className="text-amber-400 font-semibold">{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Card content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 sm:p-8 overflow-hidden"
        >
          {renderCard()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex((i) => i + 1)}
          disabled={!canGoNext}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10 disabled:shadow-none"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* AI Tutor */}
      <TutorPanel courseSlug={courseSlug} cardId={card.id} />
    </div>
  );
}
