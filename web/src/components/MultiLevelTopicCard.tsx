"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

type Level = { slug: string; level: string | null };

type Props = {
  children: ReactNode;
  levels: Level[];
  topicKey: string | null;
};

function levelLabel(l: string | null): string | null {
  if (!l) return null;
  return l.charAt(0).toUpperCase() + l.slice(1);
}

export default function MultiLevelTopicCard({
  children,
  levels,
  topicKey,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: globalThis.MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onCardClick(e: MouseEvent<HTMLDivElement>) {
    // Inline pills/links inside the card should navigate normally.
    if ((e.target as HTMLElement).closest("a,button")) return;
    setOpen((o) => !o);
  }

  function onCardKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
  }

  return (
    <div ref={ref} className="relative" data-multi-level-card="true">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onCardClick}
        onKeyDown={onCardKey}
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:rounded-2xl"
      >
        {children}
      </div>
      {open && (
        <div
          role="menu"
          data-multi-level-popover="true"
          className="absolute left-2 right-2 top-full mt-2 z-20 rounded-xl border border-gray-700 bg-gray-950/95 backdrop-blur shadow-2xl shadow-black/60 p-2"
        >
          <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500 px-3 py-2">
            Choose a level
          </div>
          {levels.map((lv) => (
            <Link
              key={lv.slug}
              href={`/courses/${lv.slug}`}
              role="menuitem"
              data-popover-level={lv.level ?? "none"}
              className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-sm text-gray-200"
            >
              {levelLabel(lv.level) ?? "Course"}
            </Link>
          ))}
          {topicKey && (
            <Link
              href={`/topics/${topicKey}/quick-check`}
              role="menuitem"
              data-popover-quick-check={topicKey}
              className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-sm text-amber-300 border-t border-gray-800 mt-1"
            >
              Not sure? Find my level →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
