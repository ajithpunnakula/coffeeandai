"use client";

import { useState } from "react";
import Link from "next/link";

type Level = "basic" | "intermediate" | "advanced";
type LevelChoice = Level | "all" | "none";

interface ProgressEvent {
  phase: string;
  card?: string;
  plan?: { title: string; cardCount: number };
  progress?: { current: number; total: number };
  error?: string;
  slug?: string;
}

interface StreamState {
  label: string;
  level: Level | null;
  events: ProgressEvent[];
  completedSlug: string | null;
  done: boolean;
  failed: boolean;
}

async function runGenerate(
  body: object,
  onEvent: (e: ProgressEvent) => void,
): Promise<{ slug: string | null; failed: boolean }> {
  const res = await fetch("/api/studio/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    onEvent({ phase: "error", error: data?.error ?? `HTTP ${res.status}` });
    return { slug: null, failed: true };
  }

  const reader = res.body?.getReader();
  if (!reader) return { slug: null, failed: true };
  const decoder = new TextDecoder();
  let buffer = "";
  let slug: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event: ProgressEvent = JSON.parse(line.slice(6));
        onEvent(event);
        if (event.phase === "complete" && event.slug) slug = event.slug;
      } catch {
        // ignore parse errors
      }
    }
  }
  return { slug, failed: false };
}

export default function NewCoursePage() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<LevelChoice>("none");
  const [audience, setAudience] = useState("");
  const [streams, setStreams] = useState<StreamState[]>([]);
  const [generating, setGenerating] = useState(false);

  function updateStream(idx: number, patch: Partial<StreamState>) {
    setStreams((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  async function handleGenerate() {
    if (!topic.trim() || generating) return;

    const targetLevels: Array<{ label: string; level: Level | null }> =
      level === "all"
        ? [
            { label: "Basic", level: "basic" },
            { label: "Intermediate", level: "intermediate" },
            { label: "Advanced", level: "advanced" },
          ]
        : level === "none"
          ? [{ label: "Course", level: null }]
          : [{ label: capitalize(level), level: level as Level }];

    const initial: StreamState[] = targetLevels.map((t) => ({
      label: t.label,
      level: t.level,
      events: [],
      completedSlug: null,
      done: false,
      failed: false,
    }));
    setStreams(initial);
    setGenerating(true);

    await Promise.all(
      targetLevels.map(async (t, i) => {
        const { slug, failed } = await runGenerate(
          {
            topic: topic.trim(),
            level: t.level,
            audience: audience.trim() || null,
          },
          (e) => {
            setStreams((prev) => {
              const next = prev.slice();
              const cur = next[i];
              next[i] = { ...cur, events: [...cur.events, e] };
              return next;
            });
          },
        );
        updateStream(i, { completedSlug: slug, done: true, failed });
      }),
    );

    setGenerating(false);
  }

  function reset() {
    setTopic("");
    setLevel("none");
    setAudience("");
    setStreams([]);
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/studio"
        className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block"
      >
        ← Studio
      </Link>
      <h1 className="text-3xl font-bold mb-2">Create a Course</h1>
      <p className="text-gray-400 text-sm mb-6">
        Describe what you want to teach. Pick a level, or generate all three at once.
      </p>

      {!generating && streams.length === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Kubernetes"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-lg placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <fieldset>
            <legend className="block text-sm text-gray-400 mb-2">Level</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { v: "none", label: "Single (no level)" },
                  { v: "basic", label: "Basic" },
                  { v: "intermediate", label: "Intermediate" },
                  { v: "advanced", label: "Advanced" },
                  { v: "all", label: "All three" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.v}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                    level === opt.v
                      ? "border-amber-500 bg-amber-500/10 text-amber-300"
                      : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={opt.v}
                    checked={level === opt.v}
                    onChange={() => setLevel(opt.v)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Audience (optional)
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., platform engineers"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {level === "all" ? "Generate all three" : "Generate"}
            </button>
          </div>
        </div>
      )}

      {streams.length > 0 && (
        <div className="space-y-4">
          {streams.map((s, i) => {
            const last = s.events[s.events.length - 1];
            const prog = last?.progress;
            const pct =
              prog && prog.total > 0
                ? Math.round((prog.current / prog.total) * 100)
                : 0;
            const errorEvent = s.events.find((e) => e.phase === "error");

            return (
              <div
                key={i}
                className="p-5 rounded-xl border border-gray-800 bg-gray-900/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-200">
                    {s.label}
                  </span>
                  {prog && prog.total > 0 && (
                    <span className="text-xs text-amber-400 tabular-nums">
                      {prog.current}/{prog.total}
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      s.failed
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                    } rounded-full transition-all duration-300`}
                    style={{ width: `${s.failed ? 100 : pct}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {errorEvent
                    ? `Error: ${errorEvent.error}`
                    : last?.phase === "planning"
                      ? "Planning..."
                      : last?.phase === "planned"
                        ? `Planned ${last.plan?.cardCount} cards`
                        : last?.phase === "generating"
                          ? `Generating: ${last.card}`
                          : last?.phase === "complete"
                            ? "Done."
                            : "Starting..."}
                </p>
                {s.completedSlug && (
                  <Link
                    href={`/studio/courses/${s.completedSlug}/edit`}
                    className="mt-3 inline-block text-sm text-amber-400 hover:text-amber-300"
                  >
                    Open in editor →
                  </Link>
                )}
              </div>
            );
          })}

          {!generating && (
            <div className="pt-2 flex gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700"
              >
                Generate another
              </button>
              <Link
                href="/studio"
                className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-300 text-sm hover:bg-amber-500/20"
              >
                Back to Studio
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
