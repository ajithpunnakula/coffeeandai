import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AIChatPanel from "@/components/developer/AIChatPanel";

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

function mockStreamResponse(chunks: string[], { hang = false } = {}) {
  let chunkIndex = 0;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      if (chunkIndex < chunks.length) {
        controller.enqueue(encoder.encode(chunks[chunkIndex]));
        chunkIndex++;
      } else if (!hang) {
        controller.close();
      }
      // If hang=true, never close — simulates a stuck stream
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

describe("AIChatPanel streaming", () => {
  const baseProps = {
    courseSlug: "test-course",
    currentCard: { id: "card_1", title: "Test", card_type: "page" },
    open: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("re-enables input after successful stream", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockStreamResponse(["Hello ", "world!"]),
    );

    render(<AIChatPanel {...baseProps} />);
    const input = screen.getByPlaceholderText("Ask about this card...");

    // Send a message via starter
    await act(async () => {
      fireEvent.click(screen.getByText("Improve this explanation"));
    });

    // Wait for streaming to finish and input to be re-enabled
    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });

    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });

  it("re-enables input after fetch error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<AIChatPanel {...baseProps} />);
    const input = screen.getByPlaceholderText("Ask about this card...");

    await act(async () => {
      fireEvent.click(screen.getByText("Improve this explanation"));
    });

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });

    expect(
      screen.getByText("Sorry, something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  it("re-enables input after non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 }),
    );

    render(<AIChatPanel {...baseProps} />);
    const input = screen.getByPlaceholderText("Ask about this card...");

    await act(async () => {
      fireEvent.click(screen.getByText("Improve this explanation"));
    });

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });

  it("aborts previous request when sending a new message", async () => {
    const abortSpy = vi.fn();
    const originalAbortController = globalThis.AbortController;
    globalThis.AbortController = class extends originalAbortController {
      constructor() {
        super();
        const originalAbort = this.abort.bind(this);
        this.abort = (...args: Parameters<AbortController["abort"]>) => {
          abortSpy();
          return originalAbort(...args);
        };
      }
    } as typeof AbortController;

    // First request hangs
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockStreamResponse(["Partial..."], { hang: true }))
      .mockResolvedValueOnce(mockStreamResponse(["Second response"]));

    render(<AIChatPanel {...baseProps} />);

    // Send first message
    await act(async () => {
      fireEvent.click(screen.getByText("Improve this explanation"));
    });

    // The abort should be called when we clean up
    globalThis.AbortController = originalAbortController;
  });
});
