"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Section } from "@/lib/split-sections";

export default function ComparisonSection({ section }: { section: Section }) {
  // Check if this section has a code block showing an anti-pattern
  const isAntiPattern = (section.heading ?? "").toLowerCase().includes("anti-pattern");

  return (
    <div className="flex flex-col justify-center min-h-[200px] py-2">
      {section.heading && (
        <div className="flex items-center gap-2 mb-4">
          {isAntiPattern ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 text-red-400 px-3 py-1 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {section.heading}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {section.heading}
            </span>
          )}
        </div>
      )}

      <div
        className={`prose prose-sm prose-invert max-w-none prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:rounded-xl prose-pre:text-xs sm:prose-pre:text-sm prose-code:text-amber-300 prose-p:text-gray-300 prose-strong:text-gray-100 rounded-xl border p-4 ${
          isAntiPattern
            ? "border-red-500/20 bg-red-500/5"
            : "border-emerald-500/20 bg-emerald-500/5"
        }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {section.bodyMd}
        </ReactMarkdown>
      </div>
    </div>
  );
}
