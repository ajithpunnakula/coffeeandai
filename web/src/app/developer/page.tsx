"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CourseDraft {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  card_count: number;
  updated_at: string;
  created_at: string;
}

interface PublishedCourse {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  card_count: number;
  published_at: string;
}

export default function DeveloperDashboard() {
  const [drafts, setDrafts] = useState<CourseDraft[]>([]);
  const [published, setPublished] = useState<PublishedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/developer/courses");
      if (!res.ok) return;
      const data = await res.json();
      setDrafts(data.drafts ?? []);
      setPublished(data.published ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/developer/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setNewTitle("");
        fetchCourses();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleClone(slug: string) {
    const res = await fetch("/api/developer/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cloneFrom: slug }),
    });
    if (res.ok) fetchCourses();
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete draft "${slug}"?`)) return;
    const res = await fetch(`/api/developer/courses/${slug}`, {
      method: "DELETE",
    });
    if (res.ok) fetchCourses();
  }

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto py-12 px-4">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
      </div>

      {/* New Course */}
      <div className="mb-8 flex gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New course title..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newTitle.trim()}
          className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? "Creating..." : "New Course"}
        </button>
      </div>

      {/* Drafts */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Drafts
        </h2>
        {drafts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No drafts yet. Create a new course or edit a published one.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <div
                key={draft.slug}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-100 line-clamp-1">
                    {draft.title}
                  </h3>
                  <span className="shrink-0 text-xs bg-yellow-500/10 text-yellow-400 rounded-full px-2 py-0.5">
                    Draft
                  </span>
                </div>
                {draft.summary && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {draft.summary}
                  </p>
                )}
                <div className="text-xs text-gray-500 mb-4">
                  {draft.card_count} cards · Updated{" "}
                  {new Date(draft.updated_at).toLocaleDateString()}
                </div>
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/developer/courses/${draft.slug}/edit`}
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
        )}
      </section>

      {/* Published */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Published
        </h2>
        {published.length === 0 ? (
          <p className="text-gray-500 text-sm">No published courses yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((course) => (
              <div
                key={course.slug}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-100 line-clamp-1">
                    {course.title}
                  </h3>
                  <span className="shrink-0 text-xs bg-emerald-500/10 text-emerald-400 rounded-full px-2 py-0.5">
                    Published
                  </span>
                </div>
                {course.summary && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {course.summary}
                  </p>
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
        )}
      </section>
    </main>
  );
}
