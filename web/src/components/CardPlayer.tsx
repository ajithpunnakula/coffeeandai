"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageCard from "./PageCard";
import type { PageCardRef } from "./PageCard";
import QuizCard from "./QuizCard";
import ScenarioCard from "./ScenarioCard";
import ReflectionCard from "./ReflectionCard";
import TutorPanel from "./TutorPanel";

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

const DOMAIN_DOT_COLORS: Record<string, string> = {
  "Agentic Architecture & Orchestration": "bg-blue-500",
  "Tool Design & MCP Integration": "bg-purple-500",
  "Claude Code Configuration & Workflows": "bg-emerald-500",
  "Prompt Engineering & Structured Output": "bg-amber-500",
  "Context Management & Reliability": "bg-cyan-500",
};

function getDomainGradient(domain: string): string {
  for (const [key, gradient] of Object.entries(DOMAIN_COLORS)) {
    if (domain?.toLowerCase().includes(key.toLowerCase().split(" ")[0])) return gradient;
  }
  return "from-amber-500 to-orange-600";
}

function getDomainDotColor(domain: string): string {
  for (const [key, color] of Object.entries(DOMAIN_DOT_COLORS)) {
    if (domain?.toLowerCase().includes(key.toLowerCase().split(" ")[0])) return color;
  }
  return "bg-amber-500";
}

const CARD_TYPE_ICONS: Record<string, string> = {
  page: "📄",
  quiz: "❓",
  scenario: "🎭",
  reflection: "💭",
};

export default function CardPlayer({ cards, courseSlug }: CardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState(1);
  const [navOpen, setNavOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);

  const pageCardRef = useRef<PageCardRef>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const card = cards[currentIndex];
  const total = cards.length;
  const cardProgressPct = Math.round(((currentIndex + 1) / total) * 100);

  // Group cards by domain
  const domainGroups = cards.reduce<
    { domain: string; cards: { index: number; title: string; type: string }[] }[]
  >((acc, c, i) => {
    const domain = c.domain ?? "General";
    let group = acc.find((g) => g.domain === domain);
    if (!group) { group = { domain, cards: [] }; acc.push(group); }
    group.cards.push({ index: i, title: c.title, type: c.card_type });
    return acc;
  }, []);

  const postProgress = useCallback(
    async (cardId: string, status: string, score?: number) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId, status, score, courseSlug }),
        });
      } catch { /* fail silently */ }
    },
    [courseSlug],
  );

  useEffect(() => { if (card) postProgress(card.id, "viewed"); }, [card, postProgress]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setNavOpen(false);
    }
    if (navOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [navOpen]);

  function handleComplete(score?: number) {
    setCompletedCards((prev) => new Set(prev).add(card.id));
    postProgress(card.id, "completed", score);
  }

  function handleSlideChange(slide: number, total: number) {
    setCurrentSlide(slide);
    setTotalSlides(total);
  }

  const goForward = useCallback(() => {
    if (card.card_type === "page" && pageCardRef.current?.canAdvanceSlide()) {
      pageCardRef.current.advanceSlide();
      return;
    }
    const canGoNext = currentIndex < total - 1 && (card.card_type === "page" || completedCards.has(card.id));
    if (canGoNext) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setCurrentSlide(0);
      setTotalSlides(1);
    }
  }, [card, currentIndex, total, completedCards]);

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

  function jumpToCard(index: number) {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setCurrentSlide(0);
    setTotalSlides(1);
    setNavOpen(false);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goForward(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goBack(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); document.querySelector<HTMLButtonElement>("[data-code-expand]")?.click(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); document.querySelector<HTMLButtonElement>("[data-code-collapse]")?.click(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goForward, goBack]);

  const isPageCard = card.card_type === "page";
  const hasMoreSlides = isPageCard && currentSlide < totalSlides - 1;
  const canGoNextCard = currentIndex < total - 1 && (isPageCard || completedCards.has(card.id));
  const canContinue = hasMoreSlides || canGoNextCard;
  const isAtLastCard = currentIndex === total - 1;
  const canGoBackAtAll = currentIndex > 0 || (isPageCard && currentSlide > 0);
  const showNav = isPageCard || completedCards.has(card.id);

  let continueLabel = "Continue";
  if (isPageCard && !hasMoreSlides && canGoNextCard) continueLabel = "Next Card";
  else if (completedCards.has(card.id)) continueLabel = "Next";

  function renderCard() {
    switch (card.card_type) {
      case "page":
        return <PageCard ref={pageCardRef} card={card} onSlideChange={handleSlideChange} />;
      case "quiz":
        return <QuizCard key={card.id} card={card} onComplete={(s) => handleComplete(s)} />;
      case "scenario":
        return <ScenarioCard key={card.id} card={card} onComplete={(s) => handleComplete(s)} />;
      case "reflection":
        return <ReflectionCard key={card.id} card={card} onComplete={() => handleComplete()} />;
      default:
        return <p>Unknown card type: {card.card_type}</p>;
    }
  }

  const domainGradient = getDomainGradient(card.domain);

  const variants = {
    enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 20 : -20, scale: 0.98 }),
    center: { opacity: 1, y: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -20 : 20, scale: 0.98 }),
  };

  return (
    <>
      {/* Scrollable content area with bottom padding for sticky bar */}
      <div className="max-w-3xl mx-auto pt-6 px-4 pb-24">
        {/* Progress header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Course progress</span>
              <span className="text-sm font-semibold text-amber-400">{cardProgressPct}%</span>
            </div>

            {/* Card nav dropdown */}
            <div className="relative" ref={navRef}>
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800/50 hover:bg-gray-800 rounded-lg px-3 py-1.5 transition-colors"
              >
                <span>Card {currentIndex + 1}/{total}</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${navOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {navOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/50 z-50">
                  {domainGroups.map((group) => (
                    <div key={group.domain}>
                      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm px-4 py-2 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getDomainDotColor(group.domain)}`} />
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                            {group.domain}
                          </span>
                        </div>
                      </div>
                      {group.cards.map((c) => (
                        <button
                          key={c.index}
                          onClick={() => jumpToCard(c.index)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-sm transition-colors ${
                            c.index === currentIndex
                              ? "bg-amber-500/10 text-amber-400"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          }`}
                        >
                          <span className="text-xs shrink-0">{CARD_TYPE_ICONS[c.type] ?? "📄"}</span>
                          <span className="truncate">{c.title}</span>
                          {completedCards.has(cards[c.index].id) && (
                            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${domainGradient} transition-all duration-500`}
              style={{ width: `${cardProgressPct}%` }}
            />
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
            <div className="p-5 sm:p-8">
              {renderCard()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky bottom navigation bar */}
      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={!canGoBackAtAll}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Tutor button — inline in the sticky bar */}
            <TutorPanel courseSlug={courseSlug} cardId={card.id} />

            <button
              onClick={goForward}
              disabled={!canContinue && !isAtLastCard}
              className={`inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none bg-gradient-to-r ${domainGradient}`}
            >
              {continueLabel}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
