"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { splitSections } from "@/lib/split-sections";
import SectionRenderer from "./sections/SectionRenderer";

interface PageCardProps {
  card: {
    id: string;
    title: string;
    domain: string;
    difficulty: number;
    body_md: string;
    audio_url?: string;
    image_url?: string;
  };
  onSlideChange?: (slideIndex: number, totalSlides: number) => void;
}

export interface PageCardRef {
  canAdvanceSlide: () => boolean;
  canGoBackSlide: () => boolean;
  advanceSlide: () => void;
  goBackSlide: () => void;
  goToSlide: (index: number) => void;
  totalSlides: number;
  currentSlide: number;
}

const SWIPE_THRESHOLD = 50;

const PageCard = forwardRef<PageCardRef, PageCardProps>(function PageCard(
  { card, onSlideChange },
  ref,
) {
  const sections = splitSections(card.body_md, card.title);
  const totalSlides = sections.length;
  const isSingleSlide = totalSlides <= 1;

  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSlideIndex(0);
    setDirection(0);
  }, [card.id]);

  useEffect(() => {
    onSlideChange?.(slideIndex, totalSlides);
  }, [slideIndex, totalSlides, onSlideChange]);

  const goForward = useCallback(() => {
    if (slideIndex < totalSlides - 1) {
      setDirection(1);
      setSlideIndex((i) => i + 1);
    }
  }, [slideIndex, totalSlides]);

  const goBack = useCallback(() => {
    if (slideIndex > 0) {
      setDirection(-1);
      setSlideIndex((i) => i - 1);
    }
  }, [slideIndex]);

  useImperativeHandle(ref, () => ({
    canAdvanceSlide: () => slideIndex < totalSlides - 1,
    canGoBackSlide: () => slideIndex > 0,
    advanceSlide: goForward,
    goBackSlide: goBack,
    goToSlide: (index: number) => {
      setDirection(index > slideIndex ? 1 : -1);
      setSlideIndex(index);
    },
    totalSlides,
    currentSlide: slideIndex,
  }), [slideIndex, totalSlides, goForward, goBack]);

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  }

  // Swipe handling
  function handleDragEnd(_: any, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD && info.velocity.x < 0) {
      goForward();
    } else if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > 0) {
      goBack();
    }
  }

  const section = sections[slideIndex];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -60 : 60 }),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-100">{card.title}</h2>
        <span className="shrink-0 rounded-full bg-amber-500/10 text-amber-400 px-2.5 py-0.5 text-xs font-medium">
          {card.domain}
        </span>
      </div>

      {/* Audio */}
      {card.audio_url && (
        <>
          <audio ref={audioRef} src={card.audio_url} onEnded={() => setPlaying(false)} />
          <button
            onClick={toggleAudio}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors"
          >
            {playing ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5 12h2l3-6v12l-3-6H5z" />
                </svg>
                Read aloud
              </>
            )}
          </button>
        </>
      )}

      {/* Image — first slide only */}
      {card.image_url && slideIndex === 0 && (
        <img src={card.image_url} alt={card.title} className="w-full rounded-lg" />
      )}

      {/* Swipeable slide content */}
      <div className="relative overflow-hidden touch-pan-y" style={{ minHeight: 200 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${card.id}-${slideIndex}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            drag={isSingleSlide ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{ cursor: isSingleSlide ? "default" : "grab" }}
          >
            <SectionRenderer section={section} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot navigation */}
      {!isSingleSlide && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {sections.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > slideIndex ? 1 : -1);
                setSlideIndex(i);
              }}
              className={`rounded-full transition-all duration-200 ${
                i === slideIndex
                  ? "w-6 h-2 bg-amber-400"
                  : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default PageCard;
