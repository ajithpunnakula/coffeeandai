import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Leaderboard</h1>
          <p className="text-gray-500 mt-1">See who&apos;s leading the pack</p>
        </div>
        <Link
          href="/courses"
          className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
        >
          Back to Courses
        </Link>
      </div>
      <Leaderboard scope="overall" period="weekly" />
    </main>
  );
}
