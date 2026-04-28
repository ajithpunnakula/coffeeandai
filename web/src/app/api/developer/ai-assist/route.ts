import { streamText, tool, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requireDeveloper, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";

export const editCardInputSchema = z.object({
  title: z.string().optional().describe("Replacement card title"),
  body_md: z
    .string()
    .optional()
    .describe(
      "Replacement markdown body for the card. For page cards, use --- to separate slides.",
    ),
  metadata: z
    .any()
    .optional()
    .describe(
      "Replacement metadata object. For quiz cards: { questions: [{prompt, choices: [{text, correct, misconception?}], objective?}], pass_threshold }. For scenario cards: { steps: [{id, situation, choices?, outcome?}] }. For reflection cards: { prompt }.",
    ),
  explanation: z
    .string()
    .describe(
      "Plain-language, non-technical explanation of what was changed and why. One or two friendly sentences.",
    ),
});

export type EditCardInput = z.infer<typeof editCardInputSchema>;

export async function POST(request: Request) {
  try {
    const user = await requireDeveloper();
    void user;
    const {
      courseSlug,
      cardId,
      messages,
      currentCardData,
      mode,
    }: {
      courseSlug?: string;
      cardId?: string;
      messages?: UIMessage[];
      currentCardData?: any;
      mode?: "chat" | "proactive";
    } = await request.json();

    if (!courseSlug || !messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "courseSlug and messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    void cardId;

    const sql = getDb();

    const courseRows = await sql`
      SELECT title, summary, domains, exam_target
      FROM content.course_drafts WHERE slug = ${courseSlug}
    `;
    const course = courseRows[0];

    const neighborCards = await sql`
      SELECT title, card_type, domain FROM content.card_drafts
      WHERE course_slug = ${courseSlug}
      ORDER BY ord
      LIMIT 10
    `;

    const systemPrompt = buildAIAssistPrompt(
      course,
      currentCardData,
      neighborCards,
      mode === "proactive",
    );

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2000,
      tools: {
        edit_card: tool({
          description:
            "Propose a replacement for one or more fields on the current card. Use this whenever the user asks to change, improve, shorten, expand, rewrite, or fix the card content. Always include a friendly, non-technical explanation of what changed and why.",
          inputSchema: editCardInputSchema,
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("POST /api/developer/ai-assist error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export function buildAIAssistPrompt(
  course: any,
  currentCard: any,
  neighbors: any[],
  proactive = false,
): string {
  const parts: string[] = [];

  parts.push(
    `You are a friendly course design partner helping a content developer refine educational material. The developer may not be technical — write in plain, simple language. Avoid jargon, code-review terminology, and references to "diffs" or "patches".`,
  );

  parts.push(
    `\nWhen the developer asks you to CHANGE, IMPROVE, SHORTEN, EXPAND, REWRITE, FIX, ADD, or REMOVE content, you MUST call the edit_card tool with the proposed replacement and a friendly explanation. Do NOT paste the proposed content into the chat — the tool call renders it as a visual preview.`,
  );

  parts.push(
    `\nWhen the developer asks a QUESTION or wants ADVICE without making changes, respond with text only. Do not call the tool.`,
  );

  parts.push(
    `\nFor edit_card, only include fields you are actually changing. Leave other fields undefined to preserve them. Always include explanation.`,
  );

  if (course) {
    parts.push(
      `\n## Course Context\nTitle: ${course.title}\nSummary: ${course.summary ?? "N/A"}\nExam Target: ${course.exam_target ?? "N/A"}`,
    );
  }

  if (currentCard) {
    parts.push(
      `\n## Current Card\nType: ${currentCard.card_type}\nTitle: ${currentCard.title}`,
    );
    if (currentCard.body_md) {
      parts.push(`Content:\n${currentCard.body_md}`);
    }
    if (currentCard.metadata) {
      const meta =
        typeof currentCard.metadata === "string"
          ? currentCard.metadata
          : JSON.stringify(currentCard.metadata, null, 2);
      parts.push(`Metadata:\n${meta}`);
    }
  }

  if (neighbors.length > 0) {
    parts.push(`\n## Other Cards in Course`);
    for (const n of neighbors) {
      parts.push(`- [${n.card_type}] ${n.title} (${n.domain ?? "General"})`);
    }
  }

  if (proactive) {
    parts.push(
      `\n## Proactive mode\nLook at the current card and suggest 1-2 specific improvements. Frame each as a friendly question (e.g. "This card is pretty long — want me to split it into two slides?"). Use the edit_card tool for each suggestion. Keep explanations short and warm. If the card already looks great, respond with one short sentence saying so and do not call the tool.`,
    );
  } else {
    parts.push(
      `\nKeep text responses under 200 words. Friendly, encouraging tone.`,
    );
  }

  return parts.join("\n");
}
