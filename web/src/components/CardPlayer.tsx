"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageCard from "./PageCard";
import type { PageCardRef } from "./PageCard";
import QuizCard from "./QuizCard";
import ScenarioCard from "./ScenarioCard";
import ReflectionCard from "./ReflectionCard";
import TutorPanel from "./TutorPanel";
import { splitSections } from "@/lib/split-sections";

interface CardPlayerProps {
  cards: any[];
  courseSlug: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  "Agentic Architecture & Orchestration": "from-blue-500 to-blue-600",
  "Tool Design & MCP Integration": "from-purple-500 to-purple-600",
  "Claude Code Configuration & Workflows": "from-emerald-500 to-emerald-600",
  "Prompt Engineering & Structured Output": "from-amber-500 to-orange-600",
  "Context Management & Reliability": "from-cyan-500 to-cyan-600",
};

function getDomainGradient(domain: string): string {
  for (const [key, gradient] of Object.entries(DOMAIN_COLORS)) {
    if (domain?.toLowerCase().includes(key.toLowerCase().split(" ")[0])) {
      return gradient;
    }
  }
  return "from-amber-500 to-orange-600";
}

export default function CardPlayer({ cards, courseSlug }: CardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState(1);

  // Track slide position within page cards for granular progress
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);

  const pageCardRef = useRef<PageCardRef>(null);

  const card = cards[currentIndex];
  const total = cards.length;

  // Precompute total slide count across all cards for the progress bar
  const cardSlideCounts = cards.map((c) => {
    if (c.card_type === "page") {
      return splitSections(c.body_md, c.title).length;
    }
    return 1;
  });
  const totalSteps = cardSlideCounts.reduce((a, b) => a + b, 0);
  const completedSteps =
    cardSlideCounts.slice(0, currentIndex).reduce((a, b) => a + b, 0) +
    (card.card_type === "page" ? currentSlide + 1 : 1);
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

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

  function handleSlideChange(slide: number, total: number) {
    setCurrentSlide(slide);
    setTotalSlides(total);
  }

  // Unified forward: advance slide within page card first, then next card
  const goForward = useCallback(() => {
    if (card.card_type === "page" && pageCardRef.current?.canAdvanceSlide()) {
      pageCardRef.current.advanceSlide();
      return;
    }
    // Advance to next card if allowed
    const canGoNext =
      currentIndex < total - 1 &&
      (card.card_type === "page" || completedCards.has(card.id));
    if (canGoNext) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setCurrentSlide(0);
      setTotalSlides(1);
    }
  }, [card, currentIndex, total, completedCards]);

  // Unified backward: go back slide first, then previous card
  const goBack = useCallback(() => {
    if (card.card_type === "page" && pageCardRef.current?.canGoBackSlide()) {
      pageCardRef.current.goBackSlide();
      return;
    }
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
      setCurrentSlide(0);
      setTotalSlides(1);
    }
  }, [card, currentIndex]);

  // Jump to a specific card
  function jumpToCard(index: number) {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setCurrentSlide(0);
    setTotalSlides(1);
  }

  // Keyboard navigation: Left/Right = slides + cards, Down/Up = code expand/collapse
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't intercept when user is typing in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "ArrowDown") {
        // Expand code blocks
        e.preventDefault();
        const expandBtn = document.querySelector<HTMLButtonElement>(
          "[data-code-expand]",
        );
        if (expandBtn) expandBtn.click();
      } else if (e.key === "ArrowUp") {
        // Collapse code blocks
        e.preventDefault();
        const collapseBtn = document.querySelector<HTMLButtonElement>(
          "[data-code-collapse]",
        );
        if (collapseBtn) collapseBtn.click();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goForward, goBack]);

  // Can the outer "Continue" button advance?
  const isPageCard = card.card_type === "page";
  const hasMoreSlides = isPageCard && currentSlide < totalSlides - 1;
  const canGoNextCard =
    currentIndex < total - 1 &&
    (isPageCard || completedCards.has(card.id));
  const canContinue = hasMoreSlides || canGoNextCard;
  const isAtLastCard = currentIndex === total - 1;
  const canGoBackAtAll = currentIndex > 0 || (isPageCard && currentSlide > 0);

  // Button label
  let continueLabel = "Continue";
  if (isPageCard && hasMoreSlides) {
    continueLabel = "Continue";
  } else if (isPageCard && !hasMoreSlides && canGoNextCard) {
    continueLabel = "Next Card";
  } else if (completedCards.has(card.id)) {
    continueLabel = "Next";
  }

  function renderCard() {
    switch (card.card_type) {
      case "page":
        return (
          <PageCard
            ref={pageCardRef}
            card={card}
            onSlideChange={handleSlideChange}
          />
        );
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

  const domainGradient = getDomainGradient(card.domain);

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? 20 : -20,
      scale: 0.98,
    }),
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? -20 : 20,
      scale: 0.98,
    }),
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Segmented progress bar — clickable to jump */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-medium text-gray-400">
            Card {currentIndex + 1} of {total}
            {isPageCard && totalSlides > 1 && (
              <span className="text-gray-600">
                {" "}
                &middot; slide {currentSlide + 1}/{totalSlides}
              </span>
            )}
          </span>
          <span className="text-amber-400 font-semibold">{progressPct}%</span>
        </div>

        {/* Segmented bar — clickable segments */}
        <div className="flex gap-0.5 h-2">
          {cards.map((c, i) => {
            const slideCount = cardSlideCounts[i];
            const isCurrentCard = i === currentIndex;
            const isPastCard = i < currentIndex;

            let fillPct = 0;
            if (isPastCard) fillPct = 100;
            else if (isCurrentCard) {
              if (c.card_type === "page" && slideCount > 1) {
                fillPct = ((currentSlide + 1) / slideCount) * 100;
              } else if (completedCards.has(c.id)) {
                fillPct = 100;
              } else {
                fillPct = 50;
              }
            }

            return (
              <button
                key={c.id}
                onClick={() => jumpToCard(i)}
                className={`flex-1 rounded-full overflow-hidden transition-all ${
                  isCurrentCard
                    ? "ring-1 ring-amber-400/50"
                    : "hover:ring-1 hover:ring-gray-600"
                } ${isPastCard || isCurrentCard ? "bg-gray-700" : "bg-gray-800"}`}
                style={{ flexGrow: slideCount }}
                title={`Card ${i + 1}: ${c.title}`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${domainGradient} transition-all duration-500`}
                  style={{ width: `${fillPct}%` }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Card content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={card.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-2xl border border-gray-800 bg-gray-900/80 overflow-hidden"
        >
          <div className={`h-1 bg-gradient-to-r ${domainGradient}`} />
          <div className="p-6 sm:p-8">
            {renderCard()}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Unified navigation — single Continue button for slides + cards */}
      {(isPageCard || completedCards.has(card.id)) && (
        <div className="flex justify-between mt-6">
          <button
            onClick={goBack}
            disabled={!canGoBackAtAll}
            className="inline-flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={goForward}
            disabled={!canContinue && !isAtLastCard}
            className={`inline-flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none min-w-[120px] justify-center bg-gradient-to-r ${domainGradient}`}
          >
            {continueLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* AI Tutor */}
      <TutorPanel courseSlug={courseSlug} cardId={card.id} />
    </div>
  );
}
