import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { neon } from "@neondatabase/serverless";
import SignInNavButton from "./SignInNavButton";

async function getUserStats(clerkId: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT total_xp, current_streak, longest_streak, last_activity_date, role
      FROM learner.users WHERE clerk_id = ${clerkId}
    `;
    if (rows.length === 0) return { streak: 0, xp: 0, role: null };
    const user = rows[0];

    // Check if streak is still valid
    let streak = user.current_streak ?? 0;
    if (user.last_activity_date && streak > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const last = new Date(user.last_activity_date);
      last.setUTCHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);
      if (diff > 1) streak = 0;
    }

    return { streak, xp: user.total_xp ?? 0, role: user.role ?? null };
  } catch {
    return { streak: 0, xp: 0, role: null };
  }
}

export default async function NavBar() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // auth() fails on routes outside clerkMiddleware (e.g. /_not-found)
  }

  const stats = userId ? await getUserStats(userId) : null;

  return (
    <nav className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-sm px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/courses" className="flex items-center gap-2 group">
          <span className="text-2xl" role="img" aria-label="coffee">
            ☕
          </span>
          <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:to-orange-400 transition-all">
            Coffee & AI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {userId && stats && (
            <>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                  stats.streak > 0
                    ? "bg-orange-500/10 text-orange-400"
                    : "bg-gray-800/50 text-gray-500"
                }`}
                title={`${stats.streak}-day streak`}
              >
                <span className={stats.streak >= 7 ? "animate-pulse" : ""}>🔥</span>
                <span className="font-semibold tabular-nums">{stats.streak}</span>
              </div>
              <Link
                href="/leaderboard"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                title={`${stats.xp.toLocaleString()} XP earned`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold tabular-nums">
                  {stats.xp.toLocaleString()}
                </span>
              </Link>
            </>
          )}
          {stats && (stats.role === "admin" || stats.role === "developer") && (
            <Link
              href="/developer"
              className="text-sm font-medium text-gray-400 hover:text-amber-400 transition-colors"
            >
              Developer
            </Link>
          )}
          {userId ? <UserButton /> : <SignInNavButton />}
        </div>
      </div>
    </nav>
  );
}
