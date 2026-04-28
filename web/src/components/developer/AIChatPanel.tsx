"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import ProposalPreview, {
  type EditProposal,
  type EditProposalFields,
} from "./ProposalPreview";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposals?: EditProposal[];
  hidden?: boolean;
}

interface UndoState {
  cardId: string;
  snapshot: Record<string, any>;
  expiresAt: number;
}

interface AIChatPanelProps {
  courseSlug: string;
  currentCard: any;
  open: boolean;
  onToggle: () => void;
  onApplyEdit?: (fields: EditProposalFields) => void;
}

const STARTERS = [
  "Make this shorter",
  "Improve this explanation",
  "Add a quiz question",
  "Suggest better choices",
];

function genId() {
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}

function snapshotCard(card: any): Record<string, any> {
  if (!card) return {};
  return {
    title: card.title,
    body_md: card.body_md,
    metadata: card.metadata,
  };
}

export default function AIChatPanel({
  courseSlug,
  currentCard,
  open,
  onToggle,
  onApplyEdit,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzedCards = useRef<Set<string>>(new Set());
  const messagesRef = useRef<ChatMessage[]>([]);
  const lastPendingProposalRef = useRef<{
    messageIndex: number;
    proposalIndex: number;
  } | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const buildHistory = useCallback(
    (existing: ChatMessage[], extra?: ChatMessage): any[] => {
      const all = extra ? [...existing, extra] : existing;
      // `hidden` is a UI-only flag (so the proactive trigger prompt doesn't
      // show up in the chat); the message still needs to reach the model.
      return all
        .filter((m) => m.role === "user" || m.content.trim().length > 0)
        .map((m) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: "text", text: m.content }],
        }));
    },
    [],
  );

  const runStream = useCallback(
    async (history: any[], assistantId: string, mode: "chat" | "proactive") => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await fetch("/api/developer/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseSlug,
            cardId: currentCard?.id,
            messages: history,
            currentCardData: currentCard,
            mode,
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          throw new Error("AI assist request failed");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const textByPartId: Record<string, string> = {};
        let assistantText = "";
        const toolInputDeltaById: Record<string, string> = {};

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let nlIdx = buffer.indexOf("\n");
            while (nlIdx !== -1) {
              const line = buffer.slice(0, nlIdx).trim();
              buffer = buffer.slice(nlIdx + 1);
              nlIdx = buffer.indexOf("\n");

              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;

              let chunk: any;
              try {
                chunk = JSON.parse(payload);
              } catch {
                continue;
              }

              if (chunk.type === "text-delta" && typeof chunk.delta === "string") {
                const id = chunk.id ?? "default";
                textByPartId[id] = (textByPartId[id] ?? "") + chunk.delta;
                assistantText = Object.values(textByPartId).join("");
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantText } : m,
                  ),
                );
              } else if (chunk.type === "tool-input-delta") {
                toolInputDeltaById[chunk.toolCallId] =
                  (toolInputDeltaById[chunk.toolCallId] ?? "") +
                  (chunk.inputTextDelta ?? "");
              } else if (chunk.type === "tool-input-available") {
                if (chunk.toolName !== "edit_card") continue;
                const input = chunk.input ?? {};
                const proposal: EditProposal = {
                  toolCallId: chunk.toolCallId,
                  fields: {
                    title: input.title,
                    body_md: input.body_md,
                    metadata: input.metadata,
                  },
                  explanation: input.explanation ?? "",
                  status: "pending",
                };
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          proposals: [...(m.proposals ?? []), proposal],
                        }
                      : m,
                  ),
                );
              } else if (chunk.type === "error") {
                throw new Error(chunk.errorText ?? "Stream error");
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.content === ""
              ? {
                  ...m,
                  content: "Sorry, something went wrong. Please try again.",
                }
              : m,
          ),
        );
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [courseSlug, currentCard],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = genId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setInput("");
      setStreaming(true);

      const history = buildHistory(messagesRef.current, userMsg);
      const next = [...messagesRef.current, userMsg, assistantMsg];
      messagesRef.current = next;
      setMessages(next);

      try {
        await runStream(history, assistantId, "chat");
      } finally {
        setStreaming(false);
      }
    },
    [streaming, buildHistory, runStream],
  );

  // Proactive analysis when a new card is selected (debounced so the developer
  // has a moment to start interacting before the AI chimes in).
  useEffect(() => {
    if (!open || !currentCard?.id) return;
    if (analyzedCards.current.has(currentCard.id)) return;

    const cardId = currentCard.id;
    const timer = setTimeout(() => {
      if (analyzedCards.current.has(cardId)) return;
      if (abortRef.current) return;
      analyzedCards.current.add(cardId);

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        content: "Take a look at this card and share any quick suggestions.",
        hidden: true,
      };
      const assistantId = genId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setStreaming(true);
      const history = buildHistory(messagesRef.current, userMsg);
      const next = [...messagesRef.current, userMsg, assistantMsg];
      messagesRef.current = next;
      setMessages(next);

      runStream(history, assistantId, "proactive").finally(() => {
        setStreaming(false);
      });
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.id, open]);

  function applyProposal(messageIndex: number, proposalIndex: number) {
    const message = messages[messageIndex];
    const proposal = message?.proposals?.[proposalIndex];
    if (!message || !proposal || proposal.status !== "pending") return;
    if (!currentCard || !onApplyEdit) return;

    const snapshot = snapshotCard(currentCard);

    onApplyEdit(proposal.fields);

    setMessages((prev) =>
      prev.map((m, mi) => {
        if (mi !== messageIndex) return m;
        const proposals = (m.proposals ?? []).map((p, pi) =>
          pi === proposalIndex ? { ...p, status: "used" as const } : p,
        );
        return { ...m, proposals };
      }),
    );

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndo({
      cardId: currentCard.id,
      snapshot,
      expiresAt: Date.now() + 5000,
    });
    undoTimerRef.current = setTimeout(() => {
      setUndo(null);
      undoTimerRef.current = null;
    }, 5000);
  }

  function keepProposal(messageIndex: number, proposalIndex: number) {
    setMessages((prev) =>
      prev.map((m, mi) => {
        if (mi !== messageIndex) return m;
        const proposals = (m.proposals ?? []).map((p, pi) =>
          pi === proposalIndex ? { ...p, status: "kept" as const } : p,
        );
        return { ...m, proposals };
      }),
    );
  }

  function performUndo() {
    if (!undo || !onApplyEdit) return;
    onApplyEdit(undo.snapshot);
    setUndo(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  // Track latest pending proposal for keyboard shortcuts
  useEffect(() => {
    let found: { messageIndex: number; proposalIndex: number } | null = null;
    for (let mi = messages.length - 1; mi >= 0; mi--) {
      const m = messages[mi];
      const proposals = m.proposals ?? [];
      for (let pi = proposals.length - 1; pi >= 0; pi--) {
        if (proposals[pi].status === "pending") {
          found = { messageIndex: mi, proposalIndex: pi };
          break;
        }
      }
      if (found) break;
    }
    lastPendingProposalRef.current = found;
  }, [messages]);

  // Cmd+Enter to apply latest pending proposal, Esc to keep
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const target = lastPendingProposalRef.current;
      if (!target) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        applyProposal(target.messageIndex, target.proposalIndex);
      } else if (e.key === "Escape") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        keepProposal(target.messageIndex, target.proposalIndex);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, messages, currentCard]);

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-amber-500 text-gray-900 shadow-lg hover:bg-amber-400 transition-colors flex items-center justify-center z-50"
        title="AI Assist"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </button>
    );
  }

  const visibleMessages = messages
    .map((m, idx) => ({ message: m, idx }))
    .filter(({ message }) => !message.hidden);

  return (
    <div className="fixed right-0 top-[7rem] bottom-0 w-96 border-l border-gray-800 bg-gray-950 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-semibold text-gray-200">AI Assist</span>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-200 text-sm"
        >
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.length === 0 && !streaming && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Try asking…</p>
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {visibleMessages.map(({ message, idx }) => (
          <div key={message.id} className="space-y-2">
            {message.role === "user" ? (
              <div className="text-sm text-gray-200 bg-gray-800 rounded-lg p-3 ml-8">
                {message.content}
              </div>
            ) : (
              <>
                {message.content && (
                  <div className="text-sm text-gray-300 prose prose-sm prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-gray-100 prose-code:text-amber-400 prose-code:bg-gray-800 prose-code:rounded prose-code:px-1">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
                {!message.content &&
                  streaming &&
                  message.id === messages[messages.length - 1]?.id && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      AI is thinking…
                    </div>
                  )}
                {(message.proposals ?? []).map((proposal, pi) => (
                  <ProposalPreview
                    key={proposal.toolCallId}
                    proposal={proposal}
                    currentCard={currentCard}
                    onUse={() => applyProposal(idx, pi)}
                    onKeep={() => keepProposal(idx, pi)}
                  />
                ))}
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Undo toast */}
      <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="mx-3 mb-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 flex items-center justify-between"
          >
            <span>Card updated.</span>
            <button
              onClick={performUndo}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Undo?
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage(input);
            }}
            placeholder="Ask about this card..."
            disabled={streaming}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              streaming || !input.trim()
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
