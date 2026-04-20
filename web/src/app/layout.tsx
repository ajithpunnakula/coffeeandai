import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Master AI certifications with interactive, card-based courses";

export const metadata: Metadata = {
  title: {
    default: "Coffee & AI",
    template: "%s | Coffee & AI",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: "Coffee & AI",
    title: "Coffee & AI",
    description: siteDescription,
    url: "https://coffeeandai.xyz",
  },
  twitter: {
    card: "summary",
    title: "Coffee & AI",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
        style={{ colorScheme: "dark" }}
      >
        <body className="min-h-full flex flex-col">
          <NavBar />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
