import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CardEditor from "@/components/studio/CardEditor";

// Mock react-markdown since it uses ESM
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));
vi.mock("remark-gfm", () => ({ default: () => {} }));

describe("CardEditor", () => {
  it("shows placeholder when no card selected", () => {
    render(<CardEditor card={null} preview={false} onChange={vi.fn()} />);
    expect(screen.getByText("Select a card to edit")).toBeInTheDocument();
  });

  it("renders PageCardEditor for page type", () => {
    const card = {
      id: "card_1",
      title: "Test Page",
      card_type: "page",
      body_md: "Hello world",
      domain: "test",
      difficulty: 1,
      metadata: {},
      image_url: null,
      audio_url: null,
    };
    render(<CardEditor card={card} preview={false} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Test Page")).toBeInTheDocument();
    expect(screen.getByText("Body (Markdown)")).toBeInTheDocument();
  });

  it("renders QuizCardEditor for quiz type", () => {
    const card = {
      id: "card_2",
      title: "Test Quiz",
      card_type: "quiz",
      metadata: {
        questions: [
          {
            prompt: "What is 1+1?",
            choices: [
              { text: "2", correct: true },
              { text: "3", correct: false },
            ],
          },
        ],
        pass_threshold: 0.7,
      },
    };
    render(<CardEditor card={card} preview={false} onChange={vi.fn()} />);
    expect(screen.getByText("Question 1")).toBeInTheDocument();
  });

  it("renders ReflectionCardEditor for reflection type", () => {
    const card = {
      id: "card_3",
      title: "Test Reflection",
      card_type: "reflection",
      metadata: { prompt: "What did you learn?" },
    };
    render(<CardEditor card={card} preview={false} onChange={vi.fn()} />);
    expect(screen.getByText("Reflection Prompt")).toBeInTheDocument();
  });

  it("renders ScenarioCardEditor for scenario type", () => {
    const card = {
      id: "card_4",
      title: "Test Scenario",
      card_type: "scenario",
      metadata: {
        steps: [
          {
            id: "start",
            situation: "You see a bug",
            choices: [{ text: "Fix it", next: "end", score: 1 }],
          },
        ],
      },
    };
    render(<CardEditor card={card} preview={false} onChange={vi.fn()} />);
    expect(screen.getByText("Step: start")).toBeInTheDocument();
  });

  it("handles stringified metadata", () => {
    const card = {
      id: "card_5",
      title: "Stringified",
      card_type: "reflection",
      metadata: JSON.stringify({ prompt: "Test prompt" }),
    };
    render(<CardEditor card={card} preview={false} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("Test prompt")).toBeInTheDocument();
  });

  it("shows unknown type message for unrecognized card types", () => {
    const card = {
      id: "card_6",
      title: "Unknown",
      card_type: "mystery",
      metadata: {},
    };
    render(<CardEditor card={card} preview={false} onChange={vi.fn()} />);
    expect(screen.getByText("Unknown card type: mystery")).toBeInTheDocument();
  });
});
