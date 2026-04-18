import { describe, it, expect } from "vitest";

/**
 * Regression test: card data mapping from DB rows to component props.
 *
 * Bug context: the play page was selecting columns that didn't exist
 * (body, front, back, options, correct_option, domain_id) and joining
 * on a non-existent content.domains table. Cards now come from a flat
 * query on content.cards with metadata in a JSONB column.
 *
 * This test verifies the mapping logic that transforms DB rows into
 * the shape each card component expects.
 */

interface DbCardRow {
  id: string;
  card_type: string;
  title: string;
  body_md: string | null;
  domain: string;
  metadata: Record<string, unknown> | string | null;
  image_url: string | null;
  audio_url: string | null;
  ord: number;
}

// Mirrors the mapping logic in courses/[slug]/play/page.tsx
function mapCard(c: DbCardRow) {
  const meta =
    (typeof c.metadata === "string" ? JSON.parse(c.metadata) : c.metadata) ?? {};
  return {
    id: String(c.id),
    card_type: c.card_type,
    title: c.title,
    body_md: c.body_md,
    domain: c.domain,
    metadata: meta,
    image_url: c.image_url,
    audio_url: c.audio_url,
  };
}

describe("card data mapping", () => {
  it("maps a page card with body_md", () => {
    const row: DbCardRow = {
      id: "card_abc",
      card_type: "page",
      title: "Intro",
      body_md: "# Welcome\nHello world",
      domain: "General",
      metadata: { speaker_notes: "Say hi" },
      image_url: null,
      audio_url: "https://blob.vercel-storage.com/audio.mp3",
      ord: 1,
    };
    const mapped = mapCard(row);
    expect(mapped.body_md).toBe("# Welcome\nHello world");
    expect(mapped.metadata.speaker_notes).toBe("Say hi");
    expect(mapped.audio_url).toBe("https://blob.vercel-storage.com/audio.mp3");
  });

  it("maps a quiz card with questions in metadata", () => {
    const row: DbCardRow = {
      id: "card_quiz1",
      card_type: "quiz",
      title: "Quiz 1",
      body_md: null,
      domain: "Architecture",
      metadata: {
        questions: [
          {
            prompt: "What is X?",
            choices: [
              { text: "A", correct: true },
              { text: "B", correct: false, misconception: "B is wrong" },
            ],
          },
        ],
        pass_threshold: 0.8,
      },
      image_url: null,
      audio_url: null,
      ord: 4,
    };
    const mapped = mapCard(row);
    expect(mapped.metadata.questions).toHaveLength(1);
    expect(mapped.metadata.questions[0].prompt).toBe("What is X?");
    expect(mapped.metadata.questions[0].choices[0].correct).toBe(true);
    expect(mapped.metadata.pass_threshold).toBe(0.8);
  });

  it("maps a scenario card with steps in metadata", () => {
    const row: DbCardRow = {
      id: "card_sc1",
      card_type: "scenario",
      title: "Scenario 1",
      body_md: null,
      domain: "MLOps",
      metadata: {
        steps: [
          {
            id: "start",
            situation: "What do you do?",
            choices: [{ text: "Option A", next: "end", score: 1 }],
          },
          { id: "end", outcome: "Done" },
        ],
      },
      image_url: null,
      audio_url: null,
      ord: 8,
    };
    const mapped = mapCard(row);
    expect(mapped.metadata.steps).toHaveLength(2);
    expect(mapped.metadata.steps[0].situation).toBe("What do you do?");
  });

  it("maps a reflection card with prompt in metadata", () => {
    const row: DbCardRow = {
      id: "card_ref1",
      card_type: "reflection",
      title: "Reflect",
      body_md: null,
      domain: "Ethics",
      metadata: { prompt: "What did you learn?" },
      image_url: null,
      audio_url: null,
      ord: 14,
    };
    const mapped = mapCard(row);
    expect(mapped.metadata.prompt).toBe("What did you learn?");
  });

  it("handles metadata stored as JSON string", () => {
    const row: DbCardRow = {
      id: "card_str",
      card_type: "page",
      title: "Stringified",
      body_md: "content",
      domain: "General",
      metadata: JSON.stringify({ speaker_notes: "notes" }),
      image_url: null,
      audio_url: null,
      ord: 1,
    };
    const mapped = mapCard(row);
    expect(mapped.metadata.speaker_notes).toBe("notes");
  });

  it("handles null metadata gracefully", () => {
    const row: DbCardRow = {
      id: "card_null",
      card_type: "page",
      title: "No Meta",
      body_md: "content",
      domain: "General",
      metadata: null,
      image_url: null,
      audio_url: null,
      ord: 1,
    };
    const mapped = mapCard(row);
    expect(mapped.metadata).toEqual({});
  });
});
