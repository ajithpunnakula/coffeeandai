import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl" role="img" aria-label="coffee">
            ☕
          </span>
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Coffee & AI
          </span>
        </div>
        <p className="text-sm text-gray-400">Master AI certifications, one card at a time</p>
      </div>
      <SignUp
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#f59e0b",
          },
        }}
      />
    </main>
  );
}
