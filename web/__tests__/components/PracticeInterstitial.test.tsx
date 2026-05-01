import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PracticeInterstitial from "@/components/PracticeInterstitial";

describe("PracticeInterstitial", () => {
  it("renders with the domain + reason and shows all three actions", () => {
    render(
      <PracticeInterstitial
        domain="Tool Design"
        reason="hard"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onDontAsk={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/three in a row/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Tool Design")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes, practice/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /not now/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /don.?t ask again/i }),
    ).toBeInTheDocument();
  });

  it("Yes → calls onAccept exactly once", () => {
    const onAccept = vi.fn();
    render(
      <PracticeInterstitial
        domain="d"
        reason="hard"
        onAccept={onAccept}
        onDecline={vi.fn()}
        onDontAsk={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /yes, practice/i }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("Not now → calls onDecline exactly once", () => {
    const onDecline = vi.fn();
    render(
      <PracticeInterstitial
        domain="d"
        reason="soft"
        onAccept={vi.fn()}
        onDecline={onDecline}
        onDontAsk={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /not now/i }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it("Don't ask again → calls onDontAsk exactly once", () => {
    const onDontAsk = vi.fn();
    render(
      <PracticeInterstitial
        domain="d"
        reason="manual"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onDontAsk={onDontAsk}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /don.?t ask again/i }),
    );
    expect(onDontAsk).toHaveBeenCalledTimes(1);
  });

  it("disables Accept while loading and shows Generating…", () => {
    render(
      <PracticeInterstitial
        domain="d"
        reason="hard"
        loading
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onDontAsk={vi.fn()}
      />,
    );
    const accept = screen.getByRole("button", { name: /generating/i });
    expect(accept).toBeDisabled();
  });
});
