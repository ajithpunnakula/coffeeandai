"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Version {
  id: string;
  version: number;
  title: string;
  published_at: string;
  published_by_name: string | null;
  card_count: number;
}

export default function VersionsPage() {
  const params = useParams<{ slug: string }>();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/studio/courses/${params.slug}/versions`,
        );
        if (res.ok) {
          const data = await res.json();
          setVersions(data.versions ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/studio"
          className="text-sm text-gray-400 hover:text-gray-200"
        >
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold">Version History</h1>
        <span className="text-sm text-gray-500">{params.slug}</span>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : versions.length === 0 ? (
        <p className="text-gray-500">No published versions yet.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-100">
                    v{v.version}
                  </span>
                  <span className="text-sm text-gray-400">{v.title}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {v.card_count} cards · Published{" "}
                  {new Date(v.published_at).toLocaleDateString()} by{" "}
                  {v.published_by_name ?? "Unknown"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
