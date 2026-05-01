"use client";

import type { TriggerReason } from "@/lib/practice-trigger";

interface Props {
  domain: string;
  reason: TriggerReason;
  loading?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onDontAsk: () => void;
}

const REASON_COPY: Record<TriggerReason, string> = {
  hard: "This topic is tricky — three in a row.",
  soft: "Recent answers in this domain have been shaky.",
  manual: "Want a quick practice round?",
};

export default function PracticeInterstitial({
  domain,
  reason,
  loading = false,
  onAccept,
  onDecline,
  onDontAsk,
}: Props) {
  return (
    <div
      data-practice-interstitial="true"
      data-practice-trigger-reason={reason}
      data-practice-trigger-domain={domain}
      className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 mb-5"
    >
      <div className="text-xs uppercase tracking-widest text-amber-300 mb-2">
        Practice round · won&rsquo;t affect your progress
      </div>
      <p className="text-sm text-gray-200 mb-4">
        {REASON_COPY[reason]} Want a 3–5 question practice round on{" "}
        <span className="font-medium text-amber-200">{domain}</span>? It won&rsquo;t
        affect your course progress.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-action="practice-accept"
          onClick={onAccept}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "Generating…" : "Yes, practice"}
        </button>
        <button
          type="button"
          data-action="practice-decline"
          onClick={onDecline}
          className="px-4 py-2 rounded-xl bg-gray-800 text-gray-200 text-sm hover:bg-gray-700"
        >
          Not now
        </button>
        <button
          type="button"
          data-action="practice-dont-ask"
          onClick={onDontAsk}
          className="ml-auto text-xs text-gray-500 hover:text-gray-300"
        >
          Don&rsquo;t ask again this session
        </button>
      </div>
    </div>
  );
}
