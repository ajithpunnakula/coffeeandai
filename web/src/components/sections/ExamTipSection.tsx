"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Section } from "@/lib/split-sections";

export default function ExamTipSection({ section }: { section: Section }) {
  const items = section.items ?? [];

  return (
    <div className="flex flex-col justify-center min-h-[200px] py-2">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-400 px-3 py-1 text-xs font-semibold">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {section.heading ?? "Exam Tip"}
        </span>
      </div>

      {section.bodyMd && (
        <div className="prose prose-sm prose-invert max-w-none prose-p:text-gray-300 mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.bodyMd}
          </ReactMarkdown>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2 border-l-2 border-amber-500/40 pl-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.2 }}
              className="text-sm text-gray-200 leading-relaxed"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <>{children}</>,
                  code: ({ children }) => (
                    <code className="text-amber-300 bg-gray-800 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  ),
                }}
              >
                {item}
              </ReactMarkdown>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
