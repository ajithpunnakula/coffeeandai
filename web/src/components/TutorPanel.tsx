"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TutorPanelProps {
  courseSlug: string;
  cardId: string;
}

const SUGGESTED_STARTERS = [
  "Explain this simply",
  "Give me a real-world example",
  "What might the exam ask?",
  "Why does this matter?",
];

export default function TutorPanel({ courseSlug, cardId }: TutorPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCardIdRef = useRef(cardId);

  useEffect(() => {
    if (cardId !== prevCardIdRef.current) {
      setMessages([]);
      prevCardIdRef.current = cardId;
    }
  }, [cardId]);

  // Close on click outside (mobile/tablet only — desktop panel stays open)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Only auto-close on smaller screens
        if (window.innerWidth < 1024) setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    setMessages((prev) => [...prev, { role: "user", content: text.trim() }]);
    setInput("");
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const resp = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, cardId, message: text.trim() }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => {
          const u = [...prev];
          u[u.length - 1] = { role: "assistant", content: err.error ?? "Something went wrong." };
          return u;
        });
        setStreaming(false);
        return;
      }
      const reader = resp.body?.getReader();
      if (!reader) { setStreaming(false); return; }
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snapshot = accumulated;
        setMessages((prev) => {
          const u = [...prev];
          u[u.length - 1] = { role: "assistant", content: snapshot };
          return u;
        });
        scrollToBottom();
      }
    } catch {
      setMessages((prev) => {
        const u = [...prev];
        u[u.length - 1] = { role: "assistant", content: "Connection error. Please try again." };
        return u;
      });
    } finally {
      setStreaming(false);
      scrollToBottom();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const chatContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="font-semibold text-gray-100 text-sm">AI Tutor</h3>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-500 hover:text-gray-300 transition-colors lg:hidden"
          aria-label="Close tutor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-4 mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Ask about this card</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={streaming}
                  className="text-xs bg-gray-800 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-amber-600 text-white rounded-br-sm"
                : "bg-gray-800 text-gray-200 rounded-bl-sm"
            }`}>
              {msg.content || (streaming && i === messages.length - 1 ? "..." : "")}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the tutor..."
          disabled={streaming}
          className="flex-1 text-sm bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm rounded-xl hover:from-amber-400 hover:to-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </div>
    </>
  );

  return (
    <div ref={panelRef}>
      {/* Orange FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
          open
            ? "bg-gray-800 shadow-black/30"
            : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500"
        }`}
        aria-label={open ? "Close AI Tutor" : "Open AI Tutor"}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel — mobile: floating above FAB, desktop: side panel on right */}
      {open && (
        <>
          {/* Mobile/tablet: floating panel */}
          <div className="fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:w-96 max-h-[60vh] bg-gray-900 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700 flex flex-col lg:hidden">
            {chatContent}
          </div>

          {/* Desktop: side panel pinned to right edge */}
          <div className="hidden lg:flex fixed z-40 top-16 right-0 bottom-0 w-96 bg-gray-900 border-l border-gray-800 flex-col shadow-2xl shadow-black/30">
            {chatContent}
          </div>
        </>
      )}
    </div>
  );
}
