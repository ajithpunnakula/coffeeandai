"use client";

import { SignInButton } from "@clerk/nextjs";

export default function SignInNavButton() {
  return (
    <SignInButton>
      <button className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
        Sign in
      </button>
    </SignInButton>
  );
}
