"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageCard from "./PageCard";
import type { PageCardRef } from "./PageCard";
import QuizCard from "./QuizCard";
import ScenarioCard from "./ScenarioCard";
import ReflectionCard from "./ReflectionCard";
import TutorPanel from "./TutorPanel";
import NavHint from "./NavHint";
import MasteryCheckpoint from "./MasteryCheckpoint";
import XpToast from "./XpToast";
import PracticeInterstitial from "./PracticeInterstitial";
import PracticeRoundModal from "./PracticeRoundModal";
import { getRemediationCards } from "@/lib/adaptive-router";
import { usePracticeTrigger } from "@/lib/usePracticeTrigger";
import type { PracticeRound } from "@/lib/practice-generator";

interface LearnerProfile {
  domain_mastery: Record<string, number>;
  weak_concepts: string[];
  summary_md?: string;
}

interface CardPlayerProps {
  cards: any[];
  courseSlug: string;
  learnerProfile?: LearnerProfile | null;
  initialCompletedCards?: string[];
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

export default function CardPlayer({ cards, courseSlug, learnerProfile, initialCompletedCards }: CardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(
    new Set(initialCompletedCards ?? []),
  );
  const [direction, setDirection] = useState(1);
  const [navOpen, setNavOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const [checkpoint, setCheckpoint] = useState<{
    domain: string;
    mastery: number;
    passed: boolean;
    remediationCardIds: string[];
  } | null>(null);
  // Track quiz scores client-side so checkpoints work even without a profile
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [xpToast, setXpToast] = useState<{ xp: number; badges?: Array<{ id: string; name: string; icon: string }>; key: number } | null>(null);

  // Phase-5 adaptive practice — sessionStorage-only, never writes to DB.
  const practiceTrigger = usePracticeTrigger();
  const [practiceRound, setPracticeRound] = useState<PracticeRound | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);

  const isAdaptive = learnerProfile != null && Object.keys(learnerProfile.domain_mastery).length > 0;

  const pageCardRef = useRef<PageCardRef>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const card = cards[currentIndex];
  const total = cards.length;
  const cardProgressPct = Math.round(((currentIndex + 1) / total) * 100);

  // Compute live domain mastery from completed cards + quiz scores
  function getLiveDomainMastery(domain: string): number {
    // Prefer server profile if available
    if (learnerProfile?.domain_mastery[domain] != null) {
      return learnerProfile.domain_mastery[domain];
    }
    // Otherwise compute from client-side quiz scores
    const domainCards = cards.filter((c) => c.domain === domain && (c.card_type === "quiz" || c.card_type === "scenario"));
    const scoredCards = domainCards.filter((c) => quizScores[c.id] != null);
    if (scoredCards.length === 0) return 0;
    return scoredCards.reduce((sum, c) => sum + (quizScores[c.id] ?? 0), 0) / scoredCards.length;
  }

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
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId, status, score, courseSlug }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.gamification && data.gamification.xpEarned > 0) {
            setXpToast({
              xp: data.gamification.xpEarned,
              badges: data.gamification.newBadges,
              key: Date.now(),
            });
          }
        }
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

    // Track score client-side for live mastery
    if (score != null && (card.card_type === "quiz" || card.card_type === "scenario")) {
      setQuizScores((prev) => ({ ...prev, [card.id]: score }));
    }

    // Show mastery checkpoint after quiz/scenario completion
    if (card.card_type === "quiz" || card.card_type === "scenario") {
      const domain = card.domain ?? "";
      // Use live mastery that incorporates this score
      const updatedScores: Record<string, number> = { ...quizScores, ...(score != null ? { [card.id]: score } : {}) };
      const domainCards = cards.filter((c: any) => c.domain === domain && (c.card_type === "quiz" || c.card_type === "scenario"));
      const scoredCards = domainCards.filter((c: any) => updatedScores[c.id as string] != null);
      const mastery = learnerProfile?.domain_mastery[domain]
        ?? (scoredCards.length > 0
          ? scoredCards.reduce((sum: number, c: any) => sum + (updatedScores[c.id as string] ?? 0), 0) / scoredCards.length
          : 0);

      const passed = score != null ? score >= (card.metadata?.pass_threshold ?? 0.7) : true;
      const remediationCardIds = !passed
        ? getRemediationCards(cards, card)
        : [];

      setCheckpoint({ domain, mastery, passed, remediationCardIds });

      // Feed the per-domain practice trigger. Pure client-side; never writes
      // to learner.card_progress (the round itself is ephemeral).
      practiceTrigger.recordAnswer({
        cardId: card.id,
        domain,
        type: card.card_type,
        correct: passed,
        timestamp: Date.now(),
      });
    }
  }

  async function handlePracticeAccept() {
    if (!practiceTrigger.evaluation.domain) return;
    setPracticeLoading(true);
    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: practiceTrigger.evaluation.domain,
          level: card.metadata?.level,
        }),
      });
      if (res.ok) {
        const round = (await res.json()) as PracticeRound;
        setPracticeRound(round);
      }
    } catch {
      /* fail silently — practice is supplemental */
    } finally {
      setPracticeLoading(false);
      practiceTrigger.clearEvaluation();
    }
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

  function handleSwipePastEnd() {
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setCurrentSlide(0);
      setTotalSlides(1);
    }
  }

  function handleSwipePastStart() {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
      setCurrentSlide(0);
      setTotalSlides(1);
    }
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

  function renderCard() {
    switch (card.card_type) {
      case "page":
        return (
          <PageCard
            ref={pageCardRef}
            card={card}
            onSlideChange={handleSlideChange}
            onSwipePastEnd={handleSwipePastEnd}
            onSwipePastStart={handleSwipePastStart}
          />
        );
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
      {/* Main content — shifts left when tutor side panel is open on desktop */}
      <div className={`pt-6 px-4 pb-8 transition-all duration-300 ${
        tutorOpen ? "lg:mr-96" : ""
      }`}>
        <div className="max-w-3xl mx-auto">
          {/* Adaptive ordering indicator */}
          {isAdaptive && (
            <div className="mb-3 flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Personalized order based on your mastery</span>
            </div>
          )}

          {/* Progress header */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Course progress</span>
                <span className="text-sm font-semibold text-amber-400">{cardProgressPct}%</span>
                {/* Show current domain mastery inline */}
                {(() => {
                  const m = getLiveDomainMastery(card.domain ?? "");
                  return m > 0 ? (
                    <span className="text-xs text-gray-500">
                      {card.domain?.split(" ")[0]}: <span className="text-gray-400 font-medium">{Math.round(m * 100)}%</span>
                    </span>
                  ) : null;
                })()}
              </div>

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
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate flex-1">
                              {group.domain}
                            </span>
                            {(() => {
                              const m = getLiveDomainMastery(group.domain);
                              return m > 0 ? (
                                <span className="text-xs text-amber-400 font-mono shrink-0">
                                  {Math.round(m * 100)}%
                                </span>
                              ) : null;
                            })()}
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

          {/* Adaptive practice trigger — inline, ephemeral, never writes to DB. */}
          {practiceTrigger.evaluation.shouldTrigger &&
            practiceTrigger.evaluation.domain &&
            !practiceRound && (
              <PracticeInterstitial
                domain={practiceTrigger.evaluation.domain}
                reason={practiceTrigger.evaluation.reason ?? "manual"}
                loading={practiceLoading}
                onAccept={handlePracticeAccept}
                onDecline={() => practiceTrigger.clearEvaluation()}
                onDontAsk={() => {
                  practiceTrigger.setSessionDontAsk(true);
                  practiceTrigger.clearEvaluation();
                }}
              />
            )}

          {/* Mastery checkpoint interstitial */}
          {checkpoint && (
            <MasteryCheckpoint
              domain={checkpoint.domain}
              mastery={checkpoint.mastery}
              passed={checkpoint.passed}
              weakConcepts={learnerProfile?.weak_concepts?.filter((wc) =>
                // Show weak concepts relevant to this domain
                cards.some((cc) => cc.domain === checkpoint.domain &&
                  (cc.title.toLowerCase().includes(wc.toLowerCase()) ||
                   cc.body_md?.toLowerCase().includes(wc.toLowerCase())))
              ) ?? []}
              onContinue={() => {
                setCheckpoint(null);
                // Auto-advance to next card so the quiz doesn't remount and loop
                if (currentIndex < total - 1) {
                  setDirection(1);
                  setCurrentIndex((i) => i + 1);
                  setCurrentSlide(0);
                  setTotalSlides(1);
                }
              }}
              onReviewWeak={() => {
                // Jump to the first remediation page card
                if (checkpoint.remediationCardIds.length > 0) {
                  const targetId = checkpoint.remediationCardIds[0];
                  const idx = cards.findIndex((c) => c.id === targetId);
                  if (idx >= 0) jumpToCard(idx);
                }
                setCheckpoint(null);
              }}
              hasRemediationCards={checkpoint.remediationCardIds.length > 0}
            />
          )}

          {/* Card content */}
          {!checkpoint && (
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
          )}
        </div>
      </div>

      <NavHint />

      <TutorPanel
        courseSlug={courseSlug}
        cardId={card.id}
        open={tutorOpen}
        onToggle={() => setTutorOpen(!tutorOpen)}
      />

      {xpToast && (
        <XpToast key={xpToast.key} xp={xpToast.xp} badges={xpToast.badges} />
      )}

      {practiceRound && (
        <PracticeRoundModal
          round={practiceRound}
          domain={practiceTrigger.evaluation.domain ?? card.domain ?? "general"}
          triggeredBy={practiceTrigger.evaluation.reason ?? "manual"}
          storageKey={`practice-${practiceTrigger.evaluation.domain ?? card.domain ?? "general"}`}
          onClose={() => setPracticeRound(null)}
        />
      )}
    </>
  );
}
