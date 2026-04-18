import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton, SignInButton } from "@clerk/nextjs";

export default async function NavBar() {
  const { userId } = await auth();

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
        <div className="flex items-center gap-4">
          {userId ? (
            <UserButton />
          ) : (
            <SignInButton>
              <button className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
