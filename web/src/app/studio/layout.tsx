import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export default async function StudioLayout({
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

  if (!user || !["admin", "author"].includes(user.role)) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">403 Forbidden</h1>
        <p className="text-gray-400 mt-2">Author access required.</p>
      </main>
    );
  }

  return <div className="flex-1 flex flex-col">{children}</div>;
}
