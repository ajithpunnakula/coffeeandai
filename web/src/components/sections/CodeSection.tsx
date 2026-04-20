"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Section } from "@/lib/split-sections";

const MAX_VISIBLE_LINES = 14;

export default function CodeSection({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = section.codeBlock ?? "";
  const lines = code.split("\n");
  const needsExpand = lines.length > MAX_VISIBLE_LINES;
  const visibleCode = expanded ? code : lines.slice(0, MAX_VISIBLE_LINES).join("\n");
  const lang = section.codeLang ?? "";

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleExpand(e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded(true);
  }

  function handleCollapse(e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded(false);
  }

  return (
    <div className="flex flex-col justify-center min-h-[200px] py-2">
      {section.heading && (
        <h3 className="text-lg font-bold text-amber-400 mb-3">
          {section.heading}
        </h3>
      )}

      {section.bodyMd && (
        <div className="prose prose-sm prose-invert max-w-none prose-p:text-gray-400 mb-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.bodyMd}
          </ReactMarkdown>
        </div>
      )}

      <div className="relative rounded-xl bg-[#0d1117] border border-gray-800 overflow-hidden">
        {/* Language label + copy button */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/50">
          <span className="text-xs text-gray-500 font-mono">{lang || "code"}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Code block */}
        <div className="overflow-x-auto p-4">
          <pre className="text-xs sm:text-sm leading-relaxed text-gray-200">
            <code>{visibleCode}</code>
          </pre>
        </div>

        {/* Expand / Collapse toggle */}
        {needsExpand && !expanded && (
          <button
            onClick={handleExpand}
            data-code-expand
            className="w-full py-2 text-xs text-amber-400 hover:text-amber-300 bg-gradient-to-t from-[#0d1117] via-[#0d1117] to-transparent border-t border-gray-800/50 transition-colors"
          >
            Show all {lines.length} lines
          </button>
        )}
        {needsExpand && expanded && (
          <button
            onClick={handleCollapse}
            data-code-collapse
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 border-t border-gray-800/50 transition-colors"
          >
            Hide lines
          </button>
        )}
      </div>
    </div>
  );
}
