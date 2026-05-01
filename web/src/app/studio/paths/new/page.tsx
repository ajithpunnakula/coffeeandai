"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewPathPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [audience, setAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/studio/paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        summary: summary.trim() || null,
        audience: audience.trim() || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `HTTP ${res.status}`);
      setSubmitting(false);
      return;
    }
    const draft = await res.json();
    router.push(`/studio/paths/${draft.slug}/edit`);
  }

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <Link
        href="/studio/paths"
        className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block"
      >
        ← Paths
      </Link>
      <h1 className="text-3xl font-bold mb-6">New path</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Kubernetes for Platform Engineers"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-lg placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="One paragraph description"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Audience (optional)
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., platform engineers"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
            {error}
          </div>
        )}
        <button
          onClick={handleCreate}
          disabled={!title.trim() || submitting}
          className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create path"}
        </button>
      </div>
    </main>
  );
}
