"use client";

import { Component, type ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import PageCard from "@/components/PageCard";

export interface EditProposalFields {
  title?: string;
  body_md?: string;
  metadata?: any;
}

export interface EditProposal {
  toolCallId: string;
  fields: EditProposalFields;
  explanation: string;
  status: "pending" | "used" | "kept";
}

interface ProposalPreviewProps {
  proposal: EditProposal;
  currentCard: any;
  onUse: () => void;
  onKeep: () => void;
}

class PreviewErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-amber-400">
            Couldn&apos;t render preview — but you can still apply it.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function mergeMetadata(current: any, next: any): any {
  if (next === undefined) {
    if (typeof current === "string") {
      try {
        return JSON.parse(current);
      } catch {
        return {};
      }
    }
    return current ?? {};
  }
  return next;
}

function PagePreview({
  proposed,
}: {
  proposed: { id: string; title: string; body_md: string; domain: string };
}) {
  return (
    <div className="rounded-lg bg-gray-900 p-4 border border-gray-800">
      <PageCard card={{ ...proposed, difficulty: 0 }} />
    </div>
  );
}

function QuizPreview({
  title,
  metadata,
}: {
  title: string;
  metadata: any;
}) {
  const questions: any[] = Array.isArray(metadata?.questions)
    ? metadata.questions
    : [];
  return (
    <div className="rounded-lg bg-gray-900 p-4 border border-gray-800 space-y-3">
      <h3 className="text-sm font-bold text-gray-100">{title}</h3>
      {questions.length === 0 ? (
        <p className="text-xs text-gray-500">No questions yet.</p>
      ) : (
        questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 inline-flex items-center rounded-full bg-amber-500/15 text-amber-400 px-2 py-0.5 text-[10px] font-medium">
                Question {qi + 1}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-200">{q.prompt}</p>
            <div className="space-y-1.5">
              {(q.choices ?? []).map((c: any, ci: number) => (
                <div
                  key={ci}
                  className={`px-3 py-2 rounded-lg border text-xs ${
                    c.correct
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200"
                      : "border-gray-700 bg-gray-800/40 text-gray-300"
                  }`}
                >
                  {c.text}
                  {c.correct && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-400">
                      correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ScenarioPreview({
  title,
  metadata,
}: {
  title: string;
  metadata: any;
}) {
  const steps: any[] = Array.isArray(metadata?.steps) ? metadata.steps : [];
  const start = steps.find((s) => s.id === "start") ?? steps[0];
  return (
    <div className="rounded-lg bg-gray-900 p-4 border border-gray-800 space-y-3">
      <h3 className="text-sm font-bold text-gray-100">{title}</h3>
      {!start ? (
        <p className="text-xs text-gray-500">No scenario steps yet.</p>
      ) : (
        <>
          <p className="text-sm text-gray-300">{start.situation}</p>
          <div className="space-y-1.5">
            {(start.choices ?? []).map((c: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/40 text-xs text-gray-300"
              >
                {c.text}
              </div>
            ))}
          </div>
          {steps.length > 1 && (
            <p className="text-[11px] text-gray-500">
              + {steps.length - 1} more step{steps.length - 1 === 1 ? "" : "s"}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ReflectionPreview({
  title,
  metadata,
}: {
  title: string;
  metadata: any;
}) {
  const prompt = metadata?.prompt ?? "";
  return (
    <div className="rounded-lg bg-gray-900 p-4 border border-gray-800 space-y-2">
      <h3 className="text-sm font-bold text-gray-100">{title}</h3>
      <p className="text-sm text-gray-300">{prompt}</p>
      <div className="h-16 rounded-md border border-dashed border-gray-700 bg-gray-800/30" />
    </div>
  );
}

export default function ProposalPreview({
  proposal,
  currentCard,
  onUse,
  onKeep,
}: ProposalPreviewProps) {
  const merged = useMemo(() => {
    const cardType = currentCard?.card_type ?? "page";
    const title = proposal.fields.title ?? currentCard?.title ?? "Untitled";
    const body_md =
      proposal.fields.body_md ?? (currentCard?.body_md as string | null) ?? "";
    const metadata = mergeMetadata(currentCard?.metadata, proposal.fields.metadata);
    return {
      id: `proposal-${proposal.toolCallId}`,
      card_type: cardType,
      title,
      body_md,
      metadata,
      domain: currentCard?.domain ?? "",
    };
  }, [proposal, currentCard]);

  const isPending = proposal.status === "pending";
  const labelMap: Record<EditProposal["status"], string | null> = {
    pending: null,
    used: "Used",
    kept: "Kept original",
  };
  const statusLabel = labelMap[proposal.status];

  const preview = (() => {
    switch (merged.card_type) {
      case "page":
        return <PagePreview proposed={merged} />;
      case "quiz":
        return <QuizPreview title={merged.title} metadata={merged.metadata} />;
      case "scenario":
        return (
          <ScenarioPreview title={merged.title} metadata={merged.metadata} />
        );
      case "reflection":
        return (
          <ReflectionPreview title={merged.title} metadata={merged.metadata} />
        );
      default:
        return (
          <div className="rounded-lg bg-gray-900 p-4 border border-gray-800 text-xs text-gray-400">
            Preview not available for this card type.
          </div>
        );
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`rounded-xl border p-3 space-y-3 ${
        isPending
          ? "border-amber-500/30 bg-amber-500/[0.03]"
          : "border-gray-800 bg-gray-900/40 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
          <svg
            className="w-3 h-3"
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
          AI suggestion
        </span>
        {statusLabel && (
          <span className="text-[11px] text-gray-500">{statusLabel}</span>
        )}
      </div>

      {proposal.explanation && (
        <p className="text-sm text-gray-300 leading-snug">
          {proposal.explanation}
        </p>
      )}

      <PreviewErrorBoundary>{preview}</PreviewErrorBoundary>

      {isPending && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onUse}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            Use this version
          </button>
          <button
            onClick={onKeep}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Keep original
          </button>
        </div>
      )}
    </motion.div>
  );
}
