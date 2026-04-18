import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScenarioCard from "@/components/ScenarioCard";

const baseCard = {
  id: "scenario-1",
  title: "Deploying a Model to Production",
  domain: "MLOps",
  difficulty: 3,
  metadata: {
    steps: [
      {
        id: "start",
        situation: "Your model has passed offline evaluation. What do you do first?",
        choices: [
          { text: "Run a canary deployment", next: "canary", score: 1.0 },
          { text: "Deploy directly to 100% of traffic", next: "full-deploy", score: 0.3 },
        ],
      },
      {
        id: "canary",
        situation: "Canary is running at 5% traffic. Latency looks good. Next step?",
        choices: [
          { text: "Gradually increase traffic to 100%", next: "outcome-good", score: 1.0 },
          { text: "Roll back immediately", next: "outcome-cautious", score: 0.5 },
        ],
      },
      {
        id: "full-deploy",
        outcome: "Deploying to 100% without testing caused a major incident.",
      },
      {
        id: "outcome-good",
        outcome: "The model was deployed safely with zero downtime.",
      },
      {
        id: "outcome-cautious",
        outcome: "Rolling back was unnecessary but showed caution.",
      },
    ],
  },
};

describe("ScenarioCard", () => {
  it("renders initial step situation and choices", () => {
    render(<ScenarioCard card={baseCard} onComplete={vi.fn()} />);
    expect(
      screen.getByText("Your model has passed offline evaluation. What do you do first?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Run a canary deployment")).toBeInTheDocument();
    expect(screen.getByText("Deploy directly to 100% of traffic")).toBeInTheDocument();
  });

  it("advances to next step on choice selection", () => {
    render(<ScenarioCard card={baseCard} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("Run a canary deployment"));
    expect(
      screen.getByText("Canary is running at 5% traffic. Latency looks good. Next step?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Gradually increase traffic to 100%")).toBeInTheDocument();
  });

  it("renders outcome on terminal step and calls onComplete", () => {
    const onComplete = vi.fn();
    render(<ScenarioCard card={baseCard} onComplete={onComplete} />);

    fireEvent.click(screen.getByText("Run a canary deployment"));
    fireEvent.click(screen.getByText("Gradually increase traffic to 100%"));

    expect(screen.getByText("Outcome")).toBeInTheDocument();
    expect(
      screen.getByText("The model was deployed safely with zero downtime."),
    ).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(1.0);
  });

  it("renders outcome for a poor path", () => {
    const onComplete = vi.fn();
    render(<ScenarioCard card={baseCard} onComplete={onComplete} />);

    fireEvent.click(screen.getByText("Deploy directly to 100% of traffic"));

    expect(
      screen.getByText("Deploying to 100% without testing caused a major incident."),
    ).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(0.3);
  });
});
