import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CardList from "@/components/studio/CardList";

const cards = [
  { id: "card_1", title: "Intro", card_type: "page", ord: 0 },
  { id: "card_2", title: "Quiz 1", card_type: "quiz", ord: 1 },
  { id: "card_3", title: "Scenario", card_type: "scenario", ord: 2 },
];

describe("CardList", () => {
  it("renders all cards", () => {
    render(
      <CardList
        cards={cards}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    expect(screen.getByText("Intro")).toBeInTheDocument();
    expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    expect(screen.getByText("Scenario")).toBeInTheDocument();
  });

  it("shows card count", () => {
    render(
      <CardList
        cards={cards}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    expect(screen.getByText("Cards (3)")).toBeInTheDocument();
  });

  it("calls onSelect when card clicked", () => {
    const onSelect = vi.fn();
    render(
      <CardList
        cards={cards}
        selectedId={null}
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Intro"));
    expect(onSelect).toHaveBeenCalledWith("card_1");
  });

  it("shows add menu when + Add clicked", () => {
    render(
      <CardList
        cards={cards}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("+ Add"));
    // Menu buttons contain emoji + type name; some type names also appear in card list
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.className.includes("hover:bg-gray-700"));
    expect(menuButtons).toHaveLength(4);
    expect(menuButtons.map((b) => b.textContent?.trim())).toEqual(
      expect.arrayContaining(["📄 Page", "❓ Quiz", "🎭 Scenario", "💭 Reflection"]),
    );
  });

  it("calls onAdd with correct type", () => {
    const onAdd = vi.fn();
    render(
      <CardList
        cards={cards}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("+ Add"));
    // The menu buttons contain emoji + text like "❓ Quiz"
    const quizBtn = screen.getAllByText(/Quiz/).find(
      (el) => el.tagName === "BUTTON" && el.textContent?.includes("Quiz"),
    );
    fireEvent.click(quizBtn!);
    expect(onAdd).toHaveBeenCalledWith("quiz");
  });
});
