"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Recall",
  2: "Application",
  3: "Analysis",
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-green-100 text-green-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-red-100 text-red-800",
};

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

export default function PageCard({ card }: PageCardProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-xl font-bold">{card.title}</h2>
        <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
          {card.domain}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[card.difficulty] ?? ""}`}
        >
          {DIFFICULTY_LABELS[card.difficulty] ?? `Level ${card.difficulty}`}
        </span>
      </div>

      {card.audio_url && (
        <>
          <audio
            ref={audioRef}
            src={card.audio_url}
            onEnded={() => setPlaying(false)}
          />
          <button
            onClick={toggleAudio}
            className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {playing ? "Pause" : "Read aloud"}
          </button>
        </>
      )}

      {card.image_url && (
        <img
          src={card.image_url}
          alt={card.title}
          className="w-full rounded-lg"
        />
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {card.body_md}
        </ReactMarkdown>
      </div>
    </div>
  );
}
