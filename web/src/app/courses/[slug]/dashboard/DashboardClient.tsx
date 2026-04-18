"use client";

import Link from "next/link";

interface DomainInfo {
  name: string;
  weight: number;
}

interface DomainProgress {
  domain: string;
  total: number;
  completed: number;
  avg_score: number | null;
}

interface Profile {
  domain_mastery: Record<string, number>;
  weak_concepts: string[];
  summary_md: string;
  updated_at: string;
}

interface EventStats {
  total_events: number;
  attempts: number;
  first_event: string;
  last_event: string;
}

interface Completion {
  score: number;
  passed: boolean;
  domain_scores: Record<string, number>;
  completed_at: string;
}

interface DashboardClientProps {
  courseSlug: string;
  courseTitle: string;
  domains: DomainInfo[];
  profile: Profile | null;
  domainProgress: DomainProgress[];
  eventStats: EventStats | null;
  completion: Completion | null;
}

function RadarChart({
  domains,
  mastery,
}: {
  domains: DomainInfo[];
  mastery: Record<string, number>;
}) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;
  const levels = 5;
  const n = domains.length;

  if (n < 3) return null;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // Start from top

  function getPoint(i: number, r: number) {
    const angle = startAngle + i * angleStep;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  // Grid levels
  const gridLevels = Array.from({ length: levels }, (_, l) => {
    const r = (radius / levels) * (l + 1);
    const points = domains.map((_, i) => getPoint(i, r));
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  });

  // Axis lines
  const axes = domains.map((_, i) => getPoint(i, radius));

  // Data polygon
  const dataPoints = domains.map((d, i) => {
    const score = mastery[d.name] ?? 0;
    const r = radius * Math.min(score, 1);
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Labels
  const labelPoints = domains.map((d, i) => {
    const p = getPoint(i, radius + 28);
    return { ...p, name: d.name };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {/* Grid */}
      {gridLevels.map((points, l) => (
        <polygon
          key={l}
          points={points}
          fill="none"
          stroke="rgb(55, 65, 81)"
          strokeWidth={0.5}
        />
      ))}

      {/* Axes */}
      {axes.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="rgb(55, 65, 81)"
          strokeWidth={0.5}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(245, 158, 11, 0.15)"
        stroke="rgb(245, 158, 11)"
        strokeWidth={2}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="rgb(245, 158, 11)"
        />
      ))}

      {/* Labels */}
      {labelPoints.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-400 text-[8px]"
        >
          {/* Shorten domain names for the chart */}
          {p.name.split(" ").slice(0, 2).join(" ")}
        </text>
      ))}
    </svg>
  );
}

export default function DashboardClient({
  courseSlug,
  courseTitle,
  domains,
  profile,
  domainProgress,
  eventStats,
  completion,
}: DashboardClientProps) {
  const totalCards = domainProgress.reduce((s, d) => s + d.total, 0);
  const completedCards = domainProgress.reduce((s, d) => s + d.completed, 0);
  const overallPct = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <main className="flex-1 pt-6 px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to course
        </Link>

        <h1 className="text-2xl font-bold text-gray-100 mb-1">Your Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">{courseTitle}</p>

        {/* Completion banner */}
        {completion && (
          <div className={`rounded-xl p-4 mb-6 border ${
            completion.passed
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20"
          }`}>
            <p className={`font-semibold ${completion.passed ? "text-emerald-400" : "text-amber-400"}`}>
              {completion.passed
                ? `Course completed! Score: ${Math.round(completion.score * 100)}%`
                : `Course attempted. Score: ${Math.round(completion.score * 100)}%`}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Domain mastery radar */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Domain Mastery</h2>
            {profile && Object.keys(profile.domain_mastery).length > 0 ? (
              <RadarChart domains={domains} mastery={profile.domain_mastery} />
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Complete more cards to see your domain mastery chart.
              </div>
            )}
          </div>

          {/* Progress by domain */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Progress</h2>
            <div className="space-y-4">
              {domainProgress.map((dp) => {
                const pct = dp.total > 0 ? Math.round((dp.completed / dp.total) * 100) : 0;
                const mastery = profile?.domain_mastery[dp.domain];
                return (
                  <div key={dp.domain}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-300 truncate mr-2">{dp.domain}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {mastery != null && (
                          <span className="text-xs text-amber-400 font-mono">
                            {Math.round(mastery * 100)}%
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {dp.completed}/{dp.total}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Overall</span>
                  <span className="text-amber-400 font-semibold">{overallPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weak concepts */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Areas to Strengthen</h2>
            {profile && profile.weak_concepts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {profile.weak_concepts.map((concept) => (
                    <span
                      key={concept}
                      className="text-sm bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg px-3 py-1.5"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/courses/${courseSlug}/practice`}
                  className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors mt-2"
                >
                  Practice these concepts
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No weak areas identified yet. Keep going!
              </p>
            )}
          </div>

          {/* Suggested actions */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Next Steps</h2>
            <div className="space-y-3">
              {overallPct < 100 && (
                <Link
                  href={`/courses/${courseSlug}/play`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 hover:bg-gray-800/50 transition-colors group"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-amber-400 transition-colors">
                      Continue Learning
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalCards - completedCards} cards remaining
                    </p>
                  </div>
                </Link>
              )}

              {profile && profile.weak_concepts.length > 0 && (
                <Link
                  href={`/courses/${courseSlug}/practice`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 hover:bg-gray-800/50 transition-colors group"
                >
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-amber-400 transition-colors">
                      Practice Weak Areas
                    </p>
                    <p className="text-xs text-gray-500">
                      {profile.weak_concepts.length} concept{profile.weak_concepts.length !== 1 ? "s" : ""} to strengthen
                    </p>
                  </div>
                </Link>
              )}

              {/* Stats */}
              {eventStats && eventStats.total_events > 0 && (
                <div className="p-3 rounded-xl bg-gray-800/30 text-sm text-gray-400">
                  {eventStats.attempts} quiz attempts across {eventStats.total_events} interactions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {profile?.summary_md && (
          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-3">AI Learning Summary</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {profile.summary_md}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
