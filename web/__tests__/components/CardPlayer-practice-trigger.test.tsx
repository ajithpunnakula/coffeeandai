/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CardPlayer from "@/components/CardPlayer";

// Mock framer-motion so AnimatePresence/motion render synchronously and
// don't fight jsdom for layout.
const MOTION_FRAMER_PROPS = new Set([
  "custom", "variants", "initial", "animate", "exit", "transition",
  "whileHover", "whileTap", "whileFocus", "whileDrag", "whileInView",
  "layout", "layoutId",
]);
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_t, name) => {
        const Comp = (props: any) => {
          const rest: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(props)) {
            if (k === "children") continue;
            if (MOTION_FRAMER_PROPS.has(k)) continue;
            rest[k] = v;
          }
          const tag = String(name);
          return (
            <div data-motion={tag} {...rest}>
              {props.children}
            </div>
          );
        };
        return Comp;
      },
    },
  ),
}));

// TutorPanel hits the AI streaming endpoint on mount via Clerk; stub it out.
vi.mock("@/components/TutorPanel", () => ({
  default: () => <div data-testid="tutor-panel" />,
}));

vi.mock("@/components/NavHint", () => ({
  default: () => null,
}));

const QUIZ = (id: string, domain = "Tool Design") => ({
  id,
  card_type: "quiz",
  title: `Quiz ${id}`,
  body_md: "",
  domain,
  metadata: {
    pass_threshold: 0.7,
    questions: [
      {
        prompt: "Pick one.",
        choices: [
          { text: "A (correct)", correct: true },
          { text: "B (wrong)", correct: false },
        ],
      },
    ],
  },
});

async function failQuiz() {
  // Click the wrong choice, then "See Results" to fire onComplete(0).
  fireEvent.click(await screen.findByText("B (wrong)"));
  fireEvent.click(screen.getByText("See Results"));
}

async function dismissCheckpoint() {
  // After a quiz, MasteryCheckpoint shows. Click "Continue" to dismiss it
  // and let CardPlayer advance to the next card.
  const cont = await screen.findByRole("button", { name: /continue/i });
  fireEvent.click(cont);
}

describe("CardPlayer — practice trigger integration", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    sessionStorage.clear();
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/practice/generate")) {
        return new Response(
          JSON.stringify({
            questions: [
              {
                prompt: "Practice Q1",
                choices: [
                  { text: "ok", correct: true, explanation: "" },
                  { text: "no", correct: false, explanation: "" },
                ],
              },
            ],
          }),
          { status: 200 },
        );
      }
      // /api/progress — pretend the write succeeded; that path is unrelated
      // to practice and remains the sole DB-writing surface.
      return new Response(JSON.stringify({ completed: false }), { status: 200 });
    }) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("after 3 wrong quiz answers in the same domain, the practice interstitial appears", async () => {
    const cards = [QUIZ("q1"), QUIZ("q2"), QUIZ("q3")];
    render(
      <CardPlayer
        cards={cards}
        courseSlug="course"
        learnerProfile={null}
        initialCompletedCards={[]}
      />,
    );

    await failQuiz();
    await dismissCheckpoint();

    await failQuiz();
    await dismissCheckpoint();

    await failQuiz();

    const interstitial = await waitFor(() => {
      const el = document.querySelector('[data-practice-interstitial="true"]');
      if (!el) throw new Error("interstitial not yet visible");
      return el;
    });
    expect(interstitial).not.toBeNull();
    expect(interstitial?.getAttribute("data-practice-trigger-reason")).toBe(
      "hard",
    );
    expect(interstitial?.getAttribute("data-practice-trigger-domain")).toBe(
      "Tool Design",
    );
  });

  it("Decline closes the interstitial without opening the practice modal (no /api/practice/generate fetch)", async () => {
    const cards = [QUIZ("q1"), QUIZ("q2"), QUIZ("q3")];
    render(
      <CardPlayer
        cards={cards}
        courseSlug="course"
        learnerProfile={null}
        initialCompletedCards={[]}
      />,
    );
    await failQuiz();
    await dismissCheckpoint();
    await failQuiz();
    await dismissCheckpoint();
    await failQuiz();

    await waitFor(() =>
      document.querySelector('[data-practice-interstitial="true"]'),
    );

    fireEvent.click(
      document.querySelector('[data-action="practice-decline"]') as Element,
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-practice-interstitial="true"]'),
      ).toBeNull();
    });
    expect(
      document.querySelector('[data-practice-modal="true"]'),
    ).toBeNull();

    const calls = (globalThis.fetch as any).mock.calls.map(
      ([url]: [string]) => url,
    );
    expect(calls.some((u: string) => u.includes("/api/practice/generate"))).toBe(
      false,
    );
  });

  it("Accept fetches /api/practice/generate and opens the practice modal; no /api/progress write happens during the practice round itself", async () => {
    const cards = [QUIZ("q1"), QUIZ("q2"), QUIZ("q3")];
    render(
      <CardPlayer
        cards={cards}
        courseSlug="course"
        learnerProfile={null}
        initialCompletedCards={[]}
      />,
    );
    await failQuiz();
    await dismissCheckpoint();
    await failQuiz();
    await dismissCheckpoint();
    await failQuiz();

    await waitFor(() =>
      document.querySelector('[data-practice-interstitial="true"]'),
    );

    // Snapshot fetch calls before practice flow so we can assert no
    // /api/progress writes happen during it.
    const beforeProgressCalls = (globalThis.fetch as any).mock.calls.filter(
      ([url]: [string]) => typeof url === "string" && url.includes("/api/progress"),
    ).length;

    fireEvent.click(
      document.querySelector('[data-action="practice-accept"]') as Element,
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-practice-modal="true"]'),
      ).not.toBeNull();
    });

    const calls = (globalThis.fetch as any).mock.calls.map(
      ([url]: [string]) => url,
    );
    expect(
      calls.some((u: string) => u.includes("/api/practice/generate")),
    ).toBe(true);

    // No new /api/progress calls were made between Accept and modal opening.
    const afterProgressCalls = (globalThis.fetch as any).mock.calls.filter(
      ([url]: [string]) => typeof url === "string" && url.includes("/api/progress"),
    ).length;
    expect(afterProgressCalls).toBe(beforeProgressCalls);
  });
});
