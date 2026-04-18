import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizCard from "@/components/QuizCard";

// Uses the real data format: prompt (not question), choices as objects with
// correct boolean (not string array with index), pass_threshold as decimal
const baseCard = {
  id: "quiz-1",
  title: "Agentic Loop Quiz",
  domain: "Agentic Architecture",
  difficulty: 2,
  metadata: {
    questions: [
      {
        prompt: "What controls whether the agentic loop continues?",
        choices: [
          { text: "The stop_reason field in the API response", correct: true },
          {
            text: "Parsing the assistant's text for 'I'm done'",
            correct: false,
            misconception: "Text parsing is unreliable for control flow.",
          },
          { text: "An iteration counter", correct: false },
          { text: "Token usage monitoring", correct: false },
        ],
        objective: "Identify stop_reason as the loop termination signal",
      },
      {
        prompt: "What does end_turn indicate?",
        choices: [
          { text: "Claude has finished and the loop should exit", correct: true },
          { text: "An error occurred", correct: false },
          { text: "Tools are exhausted", correct: false },
          { text: "Max tool calls reached", correct: false },
        ],
      },
    ],
    pass_threshold: 0.5,
  },
};

describe("QuizCard", () => {
  it("renders prompt text and all choice buttons", () => {
    render(<QuizCard card={baseCard} onComplete={vi.fn()} />);
    expect(screen.getByText("What controls whether the agentic loop continues?")).toBeInTheDocument();
    expect(screen.getByText("The stop_reason field in the API response")).toBeInTheDocument();
    expect(screen.getByText("Parsing the assistant's text for 'I'm done'")).toBeInTheDocument();
    expect(screen.getByText("An iteration counter")).toBeInTheDocument();
    expect(screen.getByText("Token usage monitoring")).toBeInTheDocument();
  });

  it("shows Next Question button after selecting an answer", () => {
    render(<QuizCard card={baseCard} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("The stop_reason field in the API response"));
    expect(screen.getByText("Next Question")).toBeInTheDocument();
  });

  it("highlights correct answer green and wrong answer red", () => {
    render(<QuizCard card={baseCard} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("An iteration counter"));

    const correctBtn = screen.getByText("The stop_reason field in the API response");
    const wrongBtn = screen.getByText("An iteration counter");
    expect(correctBtn.closest("button")!.className).toContain("border-green-500");
    expect(wrongBtn.closest("button")!.className).toContain("border-red-500");
  });

  it("shows misconception text on wrong answer when available", () => {
    render(<QuizCard card={baseCard} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Parsing the assistant's text for 'I'm done'"));
    expect(
      screen.getByText("Text parsing is unreliable for control flow."),
    ).toBeInTheDocument();
  });

  it("does not show misconception when correct answer selected", () => {
    render(<QuizCard card={baseCard} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("The stop_reason field in the API response"));
    expect(screen.queryByText("Text parsing is unreliable for control flow.")).not.toBeInTheDocument();
  });

  it("calls onComplete with score ratio when passing", () => {
    const onComplete = vi.fn();
    render(<QuizCard card={baseCard} onComplete={onComplete} />);

    // Answer Q1 correctly
    fireEvent.click(screen.getByText("The stop_reason field in the API response"));
    fireEvent.click(screen.getByText("Next Question"));

    // Answer Q2 correctly
    fireEvent.click(screen.getByText("Claude has finished and the loop should exit"));
    fireEvent.click(screen.getByText("See Results"));

    expect(onComplete).toHaveBeenCalledWith(1); // 2/2 = 1.0
    expect(screen.getByText("Passed!")).toBeInTheDocument();
  });

  it("does not call onComplete when score is below threshold", () => {
    const onComplete = vi.fn();
    render(<QuizCard card={baseCard} onComplete={onComplete} />);

    // Answer Q1 wrong
    fireEvent.click(screen.getByText("An iteration counter"));
    fireEvent.click(screen.getByText("Next Question"));

    // Answer Q2 wrong
    fireEvent.click(screen.getByText("An error occurred"));
    fireEvent.click(screen.getByText("See Results"));

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText(/Need 50% to pass/)).toBeInTheDocument();
  });

  it("shows retry button on failure and resets state", () => {
    const onComplete = vi.fn();
    render(<QuizCard card={baseCard} onComplete={onComplete} />);

    // Fail the quiz
    fireEvent.click(screen.getByText("An iteration counter"));
    fireEvent.click(screen.getByText("Next Question"));
    fireEvent.click(screen.getByText("An error occurred"));
    fireEvent.click(screen.getByText("See Results"));

    // Retry
    fireEvent.click(screen.getByText("Retry"));
    expect(screen.getByText("What controls whether the agentic loop continues?")).toBeInTheDocument();
  });

  it("disables choices after one is selected", () => {
    render(<QuizCard card={baseCard} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("The stop_reason field in the API response"));

    const buttons = screen.getAllByRole("button").filter((b) => b.textContent !== "Next Question");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
