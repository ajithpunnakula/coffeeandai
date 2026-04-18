"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface XpToastProps {
  xp: number;
  badges?: Array<{ id: string; name: string; icon: string }>;
}

export default function XpToast({ xp, badges }: XpToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm shadow-lg shadow-amber-500/10">
            <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-lg font-bold text-amber-300">+{xp} XP</span>
          </div>
          {badges && badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm"
            >
              {badges.map((b) => (
                <span key={b.id} className="text-lg" title={b.name}>
                  {b.icon}
                </span>
              ))}
              <span className="text-sm font-semibold text-purple-300">
                {badges.length === 1
                  ? `${badges[0].name} unlocked!`
                  : `${badges.length} badges unlocked!`}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
