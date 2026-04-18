import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-gray-400 mt-2">Please sign in.</p>
      </main>
    );
  }

  const sql = getDb();
  const rows = await sql`
    SELECT role FROM learner.users WHERE clerk_id = ${userId} LIMIT 1
  `;
  const user = rows[0];

  if (!user || !["admin", "developer"].includes(user.role)) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">403 Forbidden</h1>
        <p className="text-gray-400 mt-2">Developer access required.</p>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <nav className="border-b border-gray-800/50 bg-gray-900/30 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-6 text-sm">
          <Link
            href="/developer"
            className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Developer
          </Link>
          <Link
            href="/developer"
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            Courses
          </Link>
          <Link
            href="/developer/generate"
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            Generate
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
