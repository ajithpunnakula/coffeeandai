"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Section } from "@/lib/split-sections";

export default function KeypointsSection({ section }: { section: Section }) {
  const items = section.items ?? [];

  return (
    <div className="flex flex-col justify-center min-h-[200px] py-2">
      {section.heading && (
        <h3 className="text-lg font-bold text-amber-400 mb-4">
          {section.heading}
        </h3>
      )}

      {section.bodyMd && (
        <div className="prose prose-sm prose-invert max-w-none prose-p:text-gray-400 mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.bodyMd}
          </ReactMarkdown>
        </div>
      )}

      <div className="space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.25 }}
            className="flex items-start gap-3 rounded-lg bg-gray-800/40 px-4 py-3"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-gray-300 leading-relaxed">
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
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
