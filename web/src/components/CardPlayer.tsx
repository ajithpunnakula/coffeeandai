"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageCard from "./PageCard";
import QuizCard from "./QuizCard";
import ScenarioCard from "./ScenarioCard";
import ReflectionCard from "./ReflectionCard";

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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>
            Card {currentIndex + 1} of {total}
          </span>
          <span>{Math.round(((currentIndex + 1) / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow dark:shadow-gray-800 p-6"
        >
          {renderCard()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex((i) => i + 1)}
          disabled={!canGoNext}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
