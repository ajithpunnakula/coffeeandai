"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PathDraft {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  course_count: number;
  updated_at: string;
}

interface PublishedPath {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  course_count: number;
  published_at: string | null;
}

export default function StudioPathsPage() {
  const [drafts, setDrafts] = useState<PathDraft[]>([]);
  const [published, setPublished] = useState<PublishedPath[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPaths() {
    try {
      const res = await fetch("/api/studio/paths");
      if (!res.ok) return;
      const data = await res.json();
      setDrafts(data.drafts ?? []);
      setPublished(data.published ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPaths();
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete path draft "${slug}"?`)) return;
    const res = await fetch(`/api/studio/paths/${slug}`, { method: "DELETE" });
    if (res.ok) fetchPaths();
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/studio"
        className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block"
      >
        ← Studio
      </Link>
      <section className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Paths</h1>
          <p className="text-gray-400 text-sm">
            Curate ordered course sequences for an audience.
          </p>
        </div>
        <Link
          href="/studio/paths/new"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
        >
          + New path
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
                {drafts.map((d) => (
                  <div
                    key={d.slug}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-100 line-clamp-1">
                        {d.title}
                      </h3>
                      <span className="shrink-0 text-xs bg-yellow-500/10 text-yellow-400 rounded-full px-2 py-0.5 ml-2">
                        Draft
                      </span>
                    </div>
                    {d.summary && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {d.summary}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mb-4">
                      {d.course_count} courses · Updated{" "}
                      {new Date(d.updated_at).toLocaleDateString()}
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/studio/paths/${d.slug}/edit`}
                        className="flex-1 text-center px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(d.slug)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20"
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
                {published.map((p) => (
                  <div
                    key={p.slug}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-100 line-clamp-1">
                        {p.title}
                      </h3>
                      <span className="shrink-0 text-xs bg-emerald-500/10 text-emerald-400 rounded-full px-2 py-0.5 ml-2">
                        Live
                      </span>
                    </div>
                    {p.summary && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {p.summary}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mb-2">
                      {p.course_count} courses
                    </div>
                    <Link
                      href={`/paths/${p.slug}`}
                      className="mt-auto text-sm text-amber-400 hover:text-amber-300"
                    >
                      View as learner →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {drafts.length === 0 && published.length === 0 && (
            <p className="text-gray-500 text-sm">
              No paths yet. Create your first one with{" "}
              <Link
                href="/studio/paths/new"
                className="text-amber-400 hover:text-amber-300"
              >
                + New path
              </Link>
              .
            </p>
          )}
        </>
      )}
    </main>
  );
}
