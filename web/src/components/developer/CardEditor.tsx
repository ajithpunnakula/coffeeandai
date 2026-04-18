"use client";

import PageCardEditor from "./PageCardEditor";
import QuizCardEditor from "./QuizCardEditor";
import ScenarioCardEditor from "./ScenarioCardEditor";
import ReflectionCardEditor from "./ReflectionCardEditor";

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
      return <QuizCardEditor card={normalizedCard} onChange={onChange} />;
    case "scenario":
      return <ScenarioCardEditor card={normalizedCard} onChange={onChange} />;
    case "reflection":
      return <ReflectionCardEditor card={normalizedCard} onChange={onChange} />;
    default:
      return (
        <div className="p-4 text-gray-400">
          Unknown card type: {card.card_type}
        </div>
      );
  }
}
