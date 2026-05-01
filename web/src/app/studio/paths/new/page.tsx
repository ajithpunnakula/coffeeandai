"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface ProposedCourse {
  title: string;
  level: "basic" | "intermediate" | "advanced";
  position: number;
  required: boolean;
}

interface PathProposal {
  title: string;
  summary?: string | null;
  courses: ProposedCourse[];
}

export default function NewPathPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [audience, setAudience] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [proposal, setProposal] = useState<PathProposal | null>(null);
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

  async function handlePropose() {
    if (!topic.trim()) return;
    setProposing(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/paths/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as PathProposal;
      setProposal(data);
      if (!title.trim() && data.title) setTitle(data.title);
      if (!summary.trim() && data.summary) setSummary(data.summary);
    } finally {
      setProposing(false);
    }
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

      <section
        data-section="proposal"
        className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 mb-8"
      >
        <h2 className="text-sm font-semibold text-amber-300 mb-3 uppercase tracking-wide">
          Generate from topic + audience
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., Kubernetes, Rust, Prompt Engineering)"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            data-input="proposal-topic"
          />
          <button
            type="button"
            onClick={handlePropose}
            disabled={!topic.trim() || proposing}
            data-action="propose-path"
            className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
          >
            {proposing ? "Proposing…" : "Propose 3–6 courses"}
          </button>
        </div>
        {proposal && (
          <ol
            className="mt-4 space-y-1 text-sm text-gray-200"
            data-proposal-courses
          >
            {proposal.courses.map((c) => (
              <li
                key={c.position}
                className="flex items-start gap-2"
                data-proposed-course={c.position}
                data-proposed-level={c.level}
              >
                <span className="text-gray-500 tabular-nums w-6">
                  {String(c.position).padStart(2, "0")}
                </span>
                <span className="flex-1">{c.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 capitalize">
                  {c.level}
                </span>
                {!c.required && (
                  <span className="text-xs text-gray-500">optional</span>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

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
