"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  xp?: number;
  score?: number;
  streak: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userEntry?: LeaderboardEntry | null;
}

const RANK_STYLES: Record<number, string> = {
  1: "text-amber-400",
  2: "text-gray-300",
  3: "text-orange-400",
};

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

interface LeaderboardProps {
  scope?: "overall" | "course";
  slug?: string;
  period?: "alltime" | "weekly";
}

export default function Leaderboard({ scope = "overall", slug, period = "alltime" }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [activePeriod, setActivePeriod] = useState(period);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ scope });
    if (slug) params.set("slug", slug);
    if (scope === "overall") params.set("period", activePeriod);

    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ entries: [] }))
      .finally(() => setLoading(false));
  }, [scope, slug, activePeriod]);

  const isXpBased = scope === "overall";

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-100">
            {scope === "course" ? "Top Scores" : "Leaderboard"}
          </h3>
          {scope === "overall" && (
            <div className="flex gap-1 bg-gray-800/50 rounded-lg p-0.5">
              <button
                onClick={() => setActivePeriod("weekly")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activePeriod === "weekly"
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setActivePeriod("alltime")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activePeriod === "alltime"
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                All Time
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-800/50">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : data?.entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No entries yet. Be the first!
          </div>
        ) : (
          data?.entries.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors"
            >
              <span className={`w-8 text-center font-bold ${RANK_STYLES[entry.rank] ?? "text-gray-500"}`}>
                {RANK_ICONS[entry.rank] ?? `#${entry.rank}`}
              </span>
              <span className="flex-1 font-medium text-gray-200 truncate">
                {entry.displayName}
              </span>
              {entry.streak > 0 && (
                <span className="text-xs text-orange-400 flex items-center gap-0.5">
                  🔥 {entry.streak}
                </span>
              )}
              <span className="font-semibold tabular-nums text-amber-400">
                {isXpBased
                  ? `${(entry.xp ?? 0).toLocaleString()} XP`
                  : `${Math.round((entry.score ?? 0) * 100)}%`}
              </span>
            </div>
          ))
        )}
      </div>

      {/* User's own position */}
      {data?.userEntry && data.userEntry.rank > 10 && (
        <div className="border-t border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="w-8 text-center font-bold text-amber-400">
              #{data.userEntry.rank}
            </span>
            <span className="flex-1 font-medium text-amber-300 truncate">
              {data.userEntry.displayName} (you)
            </span>
            <span className="font-semibold tabular-nums text-amber-400">
              {isXpBased
                ? `${(data.userEntry.xp ?? 0).toLocaleString()} XP`
                : `${Math.round((data.userEntry.score ?? 0) * 100)}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
