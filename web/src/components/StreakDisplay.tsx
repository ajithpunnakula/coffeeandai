"use client";

interface StreakDisplayProps {
  streak: number;
  xp: number;
}

export default function StreakDisplay({ streak, xp }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          streak > 0
            ? "bg-orange-500/10 text-orange-400"
            : "bg-gray-800/50 text-gray-500"
        }`}
        title={`${streak}-day streak`}
      >
        <span className={streak >= 7 ? "animate-pulse" : ""}>🔥</span>
        <span className="font-semibold tabular-nums">{streak}</span>
      </div>
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400"
        title={`${xp.toLocaleString()} XP earned`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="font-semibold tabular-nums">
          {xp.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
