"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface CourseDraft {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  card_count: number;
  updated_at: string;
}

interface PublishedCourse {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  card_count: number;
  published_at: string;
}

interface ProgressEvent {
  phase: string;
  card?: string;
  plan?: { title: string; cardCount: number };
  progress?: { current: number; total: number };
  error?: string;
  slug?: string;
}

export default function DeveloperDashboard() {
  const [drafts, setDrafts] = useState<CourseDraft[]>([]);
  const [published, setPublished] = useState<PublishedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Generation state
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [completedSlug, setCompletedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/studio/courses");
      if (!res.ok) return;
      const data = await res.json();
      setDrafts(data.drafts ?? []);
      setPublished(data.published ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setEvents([]);
    setCompletedSlug(null);

    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setEvents([{ phase: "error", error: data.error }]);
        setGenerating(false);
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
          } catch {}
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setEvents((prev) => [...prev, { phase: "error", error: err.message }]);
      }
    } finally {
      setGenerating(false);
      fetchCourses();
    }
  }

  async function handleClone(slug: string) {
    const res = await fetch("/api/studio/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cloneFrom: slug }),
    });
    if (res.ok) fetchCourses();
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete draft "${slug}"?`)) return;
    const res = await fetch(`/api/studio/courses/${slug}`, {
      method: "DELETE",
    });
    if (res.ok) fetchCourses();
  }

  const latestEvent = events[events.length - 1];
  const progress = latestEvent?.progress;
  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      {/* Generate — the primary action */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Create a Course</h1>
        <p className="text-gray-400 text-sm mb-6">
          Describe what you want to teach and AI will generate a full course with cards, quizzes, and scenarios.
        </p>

        {!generating && !completedSlug && (
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g., Building AI Agents with Claude"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-lg placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold text-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              Generate
            </button>
          </div>
        )}

        {/* Generation progress */}
        {generating && (
          <div className="space-y-4 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {latestEvent?.phase === "planning" && "Planning course structure..."}
                {latestEvent?.phase === "planned" &&
                  `Planned ${latestEvent.plan?.cardCount} cards — generating content...`}
                {latestEvent?.phase === "generating" && `Generating: ${latestEvent.card}`}
                {latestEvent?.phase === "card_complete" && `Completed: ${latestEvent.card}`}
              </span>
              {progress && progress.total > 0 && (
                <span className="text-sm text-amber-400 font-medium tabular-nums">
                  {progress.current}/{progress.total}
                </span>
              )}
            </div>
            {progress && progress.total > 0 && (
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {events
                .filter((e) => e.phase === "card_complete")
                .map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-emerald-400">&#10003;</span>
                    {e.card}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Generation complete */}
        {completedSlug && !generating && (
          <div className="p-5 rounded-xl border border-emerald-800/50 bg-emerald-900/10 text-center space-y-3">
            <p className="text-emerald-400 font-medium">Course generated!</p>
            <Link
              href={`/studio/courses/${completedSlug}/edit`}
              className="inline-block px-6 py-2.5 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 transition-colors"
            >
              Open in Editor
            </Link>
            <button
              onClick={() => {
                setCompletedSlug(null);
                setTopic("");
                setEvents([]);
              }}
              className="block mx-auto text-sm text-gray-500 hover:text-gray-300"
            >
              Generate another
            </button>
          </div>
        )}

        {/* Error */}
        {latestEvent?.phase === "error" && !generating && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{latestEvent.error}</p>
            <button
              onClick={() => { setEvents([]); setCompletedSlug(null); }}
              className="mt-2 text-sm text-gray-400 hover:text-gray-200"
            >
              Try again
            </button>
          </div>
        )}
      </section>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Drafts */}
          {drafts.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Drafts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {drafts.map((draft) => (
                  <div
                    key={draft.slug}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-100 line-clamp-1">{draft.title}</h3>
                      <span className="shrink-0 text-xs bg-yellow-500/10 text-yellow-400 rounded-full px-2 py-0.5 ml-2">
                        Draft
                      </span>
                    </div>
                    {draft.summary && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{draft.summary}</p>
                    )}
                    <div className="text-xs text-gray-500 mb-4">
                      {draft.card_count} cards · Updated{" "}
                      {new Date(draft.updated_at).toLocaleDateString()}
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/studio/courses/${draft.slug}/edit`}
                        className="flex-1 text-center px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(draft.slug)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Published */}
          {published.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Published
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {published.map((course) => (
                  <div
                    key={course.slug}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-100 line-clamp-1">{course.title}</h3>
                      <span className="shrink-0 text-xs bg-emerald-500/10 text-emerald-400 rounded-full px-2 py-0.5 ml-2">
                        Live
                      </span>
                    </div>
                    {course.summary && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{course.summary}</p>
                    )}
                    <div className="text-xs text-gray-500 mb-4">
                      {course.card_count} cards · Published{" "}
                      {new Date(course.published_at).toLocaleDateString()}
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={() => handleClone(course.slug)}
                        className="w-full text-center px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                      >
                        Edit (create draft)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
