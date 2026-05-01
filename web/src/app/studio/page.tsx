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
  level?: string | null;
  topic_key?: string | null;
}

interface PublishedCourse {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  card_count: number;
  published_at: string;
  level?: string | null;
  topic_key?: string | null;
}

export default function StudioDashboard() {
  const [drafts, setDrafts] = useState<CourseDraft[]>([]);
  const [published, setPublished] = useState<PublishedCourse[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <section className="mb-12 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Studio</h1>
          <p className="text-gray-400 text-sm">
            Generate and edit courses. Author courses, publish to the catalog.
          </p>
        </div>
        <Link
          href="/studio/courses/new"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 transition-colors"
        >
          + New course
        </Link>
      </section>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
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
                    {draft.level && (
                      <span
                        className="self-start text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5 mb-1"
                        data-level-pill={draft.level}
                      >
                        {capitalize(draft.level)}
                      </span>
                    )}
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
                    {course.level && (
                      <span
                        className="self-start text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5 mb-1"
                        data-level-pill={course.level}
                      >
                        {capitalize(course.level)}
                      </span>
                    )}
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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
