"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface ProgressEvent {
  phase: string;
  card?: string;
  cardId?: string;
  plan?: { title: string; cardCount: number; domains: any[] };
  progress?: { current: number; total: number };
  errors?: string[];
  error?: string;
  slug?: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [examTarget, setExamTarget] = useState("");
  const [generating, setGenerating] = useState(false);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [completedSlug, setCompletedSlug] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate() {
    if (!topic.trim() || generating) return;

    setGenerating(true);
    setEvents([]);
    setCompletedSlug(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/developer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          examTarget: examTarget.trim() || null,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        setEvents([{ phase: "error", error: data.error }]);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: ProgressEvent = JSON.parse(line.slice(6));
            setEvents((prev) => [...prev, event]);

            if (event.phase === "complete" && event.slug) {
              setCompletedSlug(event.slug);
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setEvents((prev) => [...prev, { phase: "error", error: err.message }]);
      }
    } finally {
      setGenerating(false);
    }
  }

  const latestEvent = events[events.length - 1];
  const progress = latestEvent?.progress;
  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Generate Course</h1>

      {/* Step 1: Input */}
      {!generating && !completedSlug && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Building AI Agents with Claude"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-lg placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Exam Target (optional)
            </label>
            <input
              type="text"
              value={examTarget}
              onChange={(e) => setExamTarget(e.target.value)}
              placeholder="e.g., AWS Certified AI Practitioner"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full py-3 rounded-lg bg-amber-500 text-gray-900 font-semibold text-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Course
          </button>
        </div>
      )}

      {/* Step 2: Progress */}
      {generating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {latestEvent?.phase === "planning" && "Planning course structure..."}
              {latestEvent?.phase === "planned" &&
                `Planned: ${latestEvent.plan?.cardCount} cards`}
              {latestEvent?.phase === "generating" &&
                `Generating: ${latestEvent.card}`}
              {latestEvent?.phase === "card_complete" &&
                `Completed: ${latestEvent.card}`}
            </span>
            {progress && progress.total > 0 && (
              <span className="text-sm text-amber-400 font-medium">
                {progress.current}/{progress.total} ({progressPct}%)
              </span>
            )}
          </div>

          {progress && progress.total > 0 && (
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {events
              .filter((e) => e.phase === "card_complete")
              .map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-400"
                >
                  <span className="text-emerald-400">&#10003;</span>
                  {e.card}
                </div>
              ))}
          </div>

          {events.some((e) => e.phase === "validation_warning") && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-xs text-yellow-400">
                Some cards have validation warnings — you can fix them in the
                editor.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Complete */}
      {completedSlug && !generating && (
        <div className="text-center space-y-4">
          <div className="text-5xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold text-gray-100">
            Course Generated!
          </h2>
          <p className="text-gray-400">
            Your course has been created as a draft. Review and edit it before
            publishing.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/developer/courses/${completedSlug}/edit`}
              className="px-6 py-3 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 transition-colors"
            >
              Open in Editor
            </Link>
            <Link
              href="/developer"
              className="px-6 py-3 rounded-lg bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Error state */}
      {latestEvent?.phase === "error" && !generating && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400">{latestEvent.error}</p>
          <button
            onClick={() => {
              setEvents([]);
              setCompletedSlug(null);
            }}
            className="mt-2 text-sm text-gray-400 hover:text-gray-200"
          >
            Try again
          </button>
        </div>
      )}
    </main>
  );
}
