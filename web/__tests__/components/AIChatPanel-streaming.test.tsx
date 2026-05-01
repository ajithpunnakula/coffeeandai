import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AIChatPanel from "@/components/studio/AIChatPanel";

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

function sse(chunk: object) {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

function mockSSEResponse(chunks: object[], { hang = false } = {}) {
  let chunkIndex = 0;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      if (chunkIndex < chunks.length) {
        controller.enqueue(encoder.encode(sse(chunks[chunkIndex])));
        chunkIndex++;
      } else if (!hang) {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
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
      mockSSEResponse([
        { type: "text-delta", id: "t1", delta: "Hello " },
        { type: "text-delta", id: "t1", delta: "world!" },
      ]),
    );

    render(<AIChatPanel {...baseProps} />);
    const input = screen.getByPlaceholderText("Ask about this card...");

    await act(async () => {
      fireEvent.click(screen.getByText("Improve this explanation"));
    });

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

  it("renders an edit_card proposal when the AI calls the tool", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockSSEResponse([
        { type: "text-delta", id: "t1", delta: "Here is a shorter version." },
        {
          type: "tool-input-available",
          toolCallId: "call_1",
          toolName: "edit_card",
          input: {
            title: "New Title",
            body_md: "Shorter content.",
            explanation: "Shortened the introduction.",
          },
        },
      ]),
    );

    const onApplyEdit = vi.fn();
    render(<AIChatPanel {...baseProps} onApplyEdit={onApplyEdit} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Make this shorter"));
    });

    await waitFor(() => {
      expect(screen.getByText("Use this version")).toBeInTheDocument();
    });

    expect(screen.getByText("Shortened the introduction.")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Use this version"));
    });

    expect(onApplyEdit).toHaveBeenCalledWith({
      title: "New Title",
      body_md: "Shorter content.",
      metadata: undefined,
    });

    await waitFor(() => {
      expect(screen.getByText(/Card updated\./)).toBeInTheDocument();
    });
  });

  it("sends the proactive prompt to the API after the debounce", async () => {
    vi.useFakeTimers();
    try {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(mockSSEResponse([], { hang: true }));

      render(<AIChatPanel {...baseProps} />);

      // Proactive trigger debounces 1.5s
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(fetchSpy).toHaveBeenCalled();
      const [, init] = fetchSpy.mock.calls[0];
      const body = JSON.parse((init as RequestInit).body as string);
      expect(body.mode).toBe("proactive");
      expect(Array.isArray(body.messages)).toBe(true);
      expect(body.messages.length).toBeGreaterThan(0);
      expect(body.messages[0].role).toBe("user");
      expect(body.messages[0].parts[0].text.length).toBeGreaterThan(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("marks proposal as kept when 'Keep original' is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockSSEResponse([
        {
          type: "tool-input-available",
          toolCallId: "call_2",
          toolName: "edit_card",
          input: {
            body_md: "Different content",
            explanation: "Tightened wording.",
          },
        },
      ]),
    );

    const onApplyEdit = vi.fn();
    render(<AIChatPanel {...baseProps} onApplyEdit={onApplyEdit} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Improve this explanation"));
    });

    await waitFor(() => {
      expect(screen.getByText("Keep original")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Keep original"));
    });

    expect(onApplyEdit).not.toHaveBeenCalled();
    expect(screen.queryByText("Use this version")).not.toBeInTheDocument();
    expect(screen.getByText("Kept original")).toBeInTheDocument();
  });
});
