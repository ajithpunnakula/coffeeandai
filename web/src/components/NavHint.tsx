"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "coffeeandai-nav-hint-seen";

export default function NavHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if never seen before
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Small delay so it doesn't flash on page load
    const showTimer = setTimeout(() => setVisible(true), 800);

    // Auto-dismiss after 5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, "1");
    }, 5800);

    // Dismiss on any key press or touch
    function dismiss() {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, "1");
    }
    window.addEventListener("keydown", dismiss, { once: true });
    window.addEventListener("touchstart", dismiss, { once: true });

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-4 shadow-xl shadow-black/30 flex items-center gap-4">
            {/* Desktop hint */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 text-sm font-mono shadow-sm">
                  ←
                </kbd>
                <kbd className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 text-sm font-mono shadow-sm">
                  →
                </kbd>
              </div>
              <span className="text-sm text-gray-400">to navigate slides</span>
            </div>

            {/* Mobile hint */}
            <div className="flex sm:hidden items-center gap-3">
              <div className="relative w-8 h-8">
                <motion.div
                  animate={{ x: [0, -12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl"
                >
                  👆
                </motion.div>
              </div>
              <span className="text-sm text-gray-400">Swipe to navigate</span>
            </div>

            <button
              onClick={() => {
                setVisible(false);
                localStorage.setItem(STORAGE_KEY, "1");
              }}
              className="text-gray-500 hover:text-gray-300 transition-colors ml-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
