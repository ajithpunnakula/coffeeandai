"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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
}

function extractTldr(markdown: string): { tldr: string; hasMore: boolean } {
  const lines = markdown.split("\n");
  const contentLines: string[] = [];
  let charCount = 0;
  const limit = 400;

  for (const line of lines) {
    if (charCount > limit && contentLines.length > 0) break;
    // Skip headings for TLDR
    if (line.startsWith("#")) continue;
    // Skip code blocks for TLDR
    if (line.startsWith("```")) break;
    if (line.trim()) {
      contentLines.push(line);
      charCount += line.length;
    }
    if (charCount > limit) break;
  }

  const tldr = contentLines.join("\n");
  const hasMore = markdown.length > tldr.length + 50;
  return { tldr, hasMore };
}

export default function PageCard({ card }: PageCardProps) {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { tldr, hasMore } = extractTldr(card.body_md);

  function toggleAudio() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

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
          <audio
            ref={audioRef}
            src={card.audio_url}
            onEnded={() => setPlaying(false)}
          />
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

      {/* Image */}
      {card.image_url && (
        <img
          src={card.image_url}
          alt={card.title}
          className="w-full rounded-lg"
        />
      )}

      {/* Content - TLDR or Full */}
      <div className="prose prose-sm prose-invert max-w-none prose-pre:overflow-x-auto prose-pre:max-w-full prose-code:text-amber-300 prose-headings:text-gray-100 prose-a:text-amber-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {expanded ? card.body_md : tldr}
        </ReactMarkdown>
      </div>

      {/* Expand / Collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          {expanded ? (
            <>
              Show less
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              Read full content
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
