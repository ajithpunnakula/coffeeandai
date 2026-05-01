import type { Metadata } from "next";
import PracticePreviewClient from "./PracticePreviewClient";

export const metadata: Metadata = {
  title: "Practice round preview",
  description:
    "Public test harness for the adaptive practice round modal. Ephemeral; no DB writes.",
  robots: { index: false, follow: false },
};

export default function PracticePreviewPage() {
  return <PracticePreviewClient />;
}
