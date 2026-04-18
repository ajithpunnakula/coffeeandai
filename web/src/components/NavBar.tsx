import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton, SignInButton } from "@clerk/nextjs";

export default async function NavBar() {
  const { userId } = await auth();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/courses" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          LLM Wiki
        </Link>
        <div className="flex items-center gap-4">
          {userId ? (
            <UserButton />
          ) : (
            <SignInButton>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
