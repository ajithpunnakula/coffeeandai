import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageCard from "@/components/PageCard";

const baseCard = {
  id: "card-1",
  title: "Introduction to Neural Networks",
  domain: "Machine Learning",
  difficulty: 1,
  body_md: "Neural networks are **computational models** inspired by the brain.",
};

describe("PageCard", () => {
  it("renders title and domain badge", () => {
    render(<PageCard card={baseCard} />);
    expect(screen.getByText("Introduction to Neural Networks")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
  });

  it("renders markdown body content", () => {
    render(<PageCard card={baseCard} />);
    expect(screen.getByText("computational models")).toBeInTheDocument();
  });

  it("shows audio toggle when audio_url is present", () => {
    render(<PageCard card={{ ...baseCard, audio_url: "/audio/card-1.mp3" }} />);
    expect(screen.getByRole("button", { name: "Read aloud" })).toBeInTheDocument();
  });

  it("does not show audio toggle when audio_url is absent", () => {
    render(<PageCard card={baseCard} />);
    expect(screen.queryByRole("button", { name: "Read aloud" })).not.toBeInTheDocument();
  });
});
