import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReflectionCard from "@/components/ReflectionCard";

const baseCard = {
  id: "reflection-1",
  title: "Reflect on Model Bias",
  domain: "AI Ethics",
  difficulty: 2,
  metadata: {
    prompt: "Describe a situation where model bias could cause real-world harm.",
  },
};

describe("ReflectionCard", () => {
  it("renders prompt", () => {
    render(<ReflectionCard card={baseCard} onComplete={vi.fn()} />);
    expect(
      screen.getByText("Describe a situation where model bias could cause real-world harm."),
    ).toBeInTheDocument();
  });

  it("submit button is disabled until text reaches 20 characters", () => {
    render(<ReflectionCard card={baseCard} onComplete={vi.fn()} />);
    const submitBtn = screen.getByRole("button", { name: "Submit" });
    const textarea = screen.getByPlaceholderText("Write your reflection here...");

    expect(submitBtn).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "Too short" } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(textarea, {
      target: { value: "This is long enough to pass the minimum character requirement." },
    });
    expect(submitBtn).toBeEnabled();
  });

  it("calls onComplete after submission", () => {
    const onComplete = vi.fn();
    render(<ReflectionCard card={baseCard} onComplete={onComplete} />);
    const textarea = screen.getByPlaceholderText("Write your reflection here...");

    fireEvent.change(textarea, {
      target: { value: "Bias in hiring algorithms can discriminate against protected groups." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.getByText("Reflection submitted.")).toBeInTheDocument();
  });

  it("disables textarea after submission", () => {
    render(<ReflectionCard card={baseCard} onComplete={vi.fn()} />);
    const textarea = screen.getByPlaceholderText("Write your reflection here...");

    fireEvent.change(textarea, {
      target: { value: "Bias in hiring algorithms can discriminate against protected groups." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(textarea).toBeDisabled();
  });
});
