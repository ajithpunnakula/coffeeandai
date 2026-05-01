import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AIChatPanel from "@/components/studio/AIChatPanel";

// Mock react-markdown
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("AIChatPanel", () => {
  const baseProps = {
    courseSlug: "test-course",
    currentCard: { id: "card_1", title: "Test", card_type: "page" },
    open: false,
    onToggle: vi.fn(),
  };

  it("shows FAB button when closed", () => {
    render(<AIChatPanel {...baseProps} />);
    const fab = screen.getByTitle("AI Assist");
    expect(fab).toBeInTheDocument();
  });

  it("calls onToggle when FAB clicked", () => {
    const onToggle = vi.fn();
    render(<AIChatPanel {...baseProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByTitle("AI Assist"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows panel header when open", () => {
    render(<AIChatPanel {...baseProps} open={true} />);
    expect(screen.getByText("AI Assist")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("shows suggested starters when no messages", () => {
    render(<AIChatPanel {...baseProps} open={true} />);
    expect(screen.getByText("Improve this explanation")).toBeInTheDocument();
    expect(screen.getByText("Add a quiz question")).toBeInTheDocument();
    expect(screen.getByText("Make this shorter")).toBeInTheDocument();
  });

  it("has input field and send button", () => {
    render(<AIChatPanel {...baseProps} open={true} />);
    expect(
      screen.getByPlaceholderText("Ask about this card..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<AIChatPanel {...baseProps} open={true} />);
    expect(screen.getByText("Send")).toBeDisabled();
  });

  it("enables send button when input has text", () => {
    render(<AIChatPanel {...baseProps} open={true} />);
    fireEvent.change(screen.getByPlaceholderText("Ask about this card..."), {
      target: { value: "Help me" },
    });
    expect(screen.getByText("Send")).toBeEnabled();
  });
});
