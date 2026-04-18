"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Section } from "@/lib/split-sections";

export default function ConceptSection({ section }: { section: Section }) {
  return (
    <div className="flex flex-col justify-center min-h-[200px] py-2">
      {section.heading && (
        <h3 className="text-lg font-bold text-amber-400 mb-4">
          {section.heading}
        </h3>
      )}
      <div className="prose prose-sm prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-gray-100 prose-a:text-amber-400 prose-headings:text-gray-100">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {section.bodyMd}
        </ReactMarkdown>
      </div>
    </div>
  );
}
