"use client";

import { Component, type ReactNode } from "react";
import PageCardEditor from "./PageCardEditor";
import QuizCardEditor from "./QuizCardEditor";
import ScenarioCardEditor from "./ScenarioCardEditor";
import ReflectionCardEditor from "./ReflectionCardEditor";

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
        <div className="p-6 text-center space-y-2">
          <p className="text-red-400 text-sm">Preview failed to render</p>
          <p className="text-gray-500 text-xs font-mono">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CardEditorProps {
  card: any;
  preview: boolean;
  onChange: (fields: Record<string, any>) => void;
}

export default function CardEditor({
  card,
  preview,
  onChange,
}: CardEditorProps) {
  if (!card) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select a card to edit
      </div>
    );
  }

  // Ensure metadata is parsed
  const metadata =
    typeof card.metadata === "string"
      ? JSON.parse(card.metadata)
      : card.metadata ?? {};
  const normalizedCard = { ...card, metadata };

  const editor = (() => {
    switch (card.card_type) {
      case "page":
        return (
          <PageCardEditor
            card={normalizedCard}
            preview={preview}
            onChange={onChange}
          />
        );
      case "quiz":
        return <QuizCardEditor card={normalizedCard} preview={preview} onChange={onChange} />;
      case "scenario":
        return <ScenarioCardEditor card={normalizedCard} preview={preview} onChange={onChange} />;
      case "reflection":
        return <ReflectionCardEditor card={normalizedCard} preview={preview} onChange={onChange} />;
      default:
        return (
          <div className="p-4 text-gray-400">
            Unknown card type: {card.card_type}
          </div>
        );
    }
  })();

  if (preview) {
    return <PreviewErrorBoundary key={card.id}>{editor}</PreviewErrorBoundary>;
  }

  return editor;
}
