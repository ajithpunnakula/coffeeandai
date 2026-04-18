import { generateObject, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getDb } from "./db";
import { generateCardId } from "./draft-db";

const coursePlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  estimated_minutes: z.number(),
  pass_threshold: z.number().min(0).max(1),
  domains: z.array(
    z.object({
      name: z.string(),
      weight: z.number(),
    }),
  ),
  cards: z.array(
    z.object({
      title: z.string(),
      card_type: z.enum(["page", "quiz", "scenario", "reflection"]),
      domain: z.string(),
      difficulty: z.number().min(0).max(3),
      description: z.string(),
    }),
  ),
});

export type CoursePlan = z.infer<typeof coursePlanSchema>;

export async function planCourse(
  topic: string,
  wikiContent: string | null,
  examTarget: string | null,
): Promise<CoursePlan> {
  const prompt = buildPlanPrompt(topic, wikiContent, examTarget);

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: coursePlanSchema,
    prompt,
  });

  return result.object;
}

export async function generateCardContent(
  cardSpec: CoursePlan["cards"][0],
  courseContext: { title: string; topic: string; domains: CoursePlan["domains"] },
): Promise<{ body_md: string; metadata: any }> {
  const prompt = buildCardPrompt(cardSpec, courseContext);

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    prompt,
    maxTokens: 3000,
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  return parseCardOutput(cardSpec.card_type, fullText);
}

export function validateCard(
  cardType: string,
  metadata: any,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (cardType === "quiz") {
    const questions = metadata?.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      errors.push("Quiz must have at least one question");
    } else {
      for (const [i, q] of questions.entries()) {
        if (!q.choices || q.choices.length < 4) {
          errors.push(`Question ${i + 1} must have at least 4 choices`);
        }
        const correctCount = q.choices?.filter((c: any) => c.correct).length;
        if (correctCount !== 1) {
          errors.push(`Question ${i + 1} must have exactly 1 correct answer`);
        }
        const wrongChoices = q.choices?.filter((c: any) => !c.correct) ?? [];
        const hasMisconceptions = wrongChoices.some(
          (c: any) => c.misconception,
        );
        if (!hasMisconceptions) {
          errors.push(`Question ${i + 1} should have misconception explanations`);
        }
      }
    }
  }

  if (cardType === "scenario") {
    const steps = metadata?.steps;
    if (!Array.isArray(steps) || steps.length < 2) {
      errors.push("Scenario must have at least 2 steps");
    } else {
      const hasOutcome = steps.some((s: any) => s.outcome);
      if (!hasOutcome) {
        errors.push("Scenario must have at least one outcome step");
      }
    }
  }

  if (cardType === "reflection") {
    if (!metadata?.prompt || metadata.prompt.trim().length < 10) {
      errors.push("Reflection must have a meaningful prompt");
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function saveDraftCard(
  courseSlug: string,
  card: {
    title: string;
    card_type: string;
    domain: string;
    difficulty: number;
    body_md: string;
    metadata: any;
    ord: number;
  },
): Promise<string> {
  const sql = getDb();
  const id = generateCardId();

  await sql`
    INSERT INTO content.card_drafts (
      id, course_slug, card_type, ord, difficulty, title,
      body_md, domain, metadata
    ) VALUES (
      ${id}, ${courseSlug}, ${card.card_type}, ${card.ord},
      ${card.difficulty}, ${card.title}, ${card.body_md},
      ${card.domain}, ${JSON.stringify(card.metadata)}
    )
  `;

  return id;
}

function buildPlanPrompt(
  topic: string,
  wikiContent: string | null,
  examTarget: string | null,
): string {
  const parts = [
    `Design a comprehensive training course on: "${topic}"`,
    `Create a structured course with a mix of card types:`,
    `- page: Teaching content with markdown (use ## for slides)`,
    `- quiz: Multiple-choice questions with 4+ choices each`,
    `- scenario: Branching decision scenarios`,
    `- reflection: Open-ended reflection prompts`,
    ``,
    `Aim for 15-30 cards total, alternating between teaching and assessment.`,
    `Each domain should have page cards followed by quiz/scenario assessment.`,
    `End with a reflection card.`,
  ];

  if (examTarget) {
    parts.push(`\nExam target: ${examTarget}`);
  }

  if (wikiContent) {
    parts.push(`\n## Reference Material\n${wikiContent.slice(0, 4000)}`);
  }

  return parts.join("\n");
}

function buildCardPrompt(
  cardSpec: CoursePlan["cards"][0],
  context: { title: string; topic: string; domains: CoursePlan["domains"] },
): string {
  const parts = [
    `Generate content for a ${cardSpec.card_type} card in the course "${context.title}" (topic: ${context.topic}).`,
    `Card title: "${cardSpec.title}"`,
    `Domain: ${cardSpec.domain}`,
    `Difficulty: ${cardSpec.difficulty} (0=recall, 1=understand, 2=apply, 3=analyze)`,
    `Description: ${cardSpec.description}`,
  ];

  switch (cardSpec.card_type) {
    case "page":
      parts.push(
        `\nWrite the card body in markdown. Use ## headings to split into slides.`,
        `Include key concepts, examples, and practical tips.`,
        `Output ONLY the markdown content.`,
      );
      break;
    case "quiz":
      parts.push(
        `\nGenerate a JSON object with:`,
        `{ "questions": [{ "prompt": "...", "choices": [{ "text": "...", "correct": true/false, "misconception": "..." }] }], "pass_threshold": 0.7 }`,
        `Each question must have exactly 4 choices, 1 correct.`,
        `Wrong choices must have misconception explanations.`,
        `Output ONLY the JSON.`,
      );
      break;
    case "scenario":
      parts.push(
        `\nGenerate a JSON object with:`,
        `{ "steps": [{ "id": "start", "situation": "...", "choices": [{ "text": "...", "next": "step_id", "score": 0-1 }] }, { "id": "end", "situation": "...", "outcome": "..." }] }`,
        `Create 3-5 steps with branching choices.`,
        `Output ONLY the JSON.`,
      );
      break;
    case "reflection":
      parts.push(
        `\nGenerate a JSON object with:`,
        `{ "prompt": "..." }`,
        `The prompt should be thought-provoking and relate to practical application.`,
        `Output ONLY the JSON.`,
      );
      break;
  }

  return parts.join("\n");
}

function parseCardOutput(
  cardType: string,
  text: string,
): { body_md: string; metadata: any } {
  if (cardType === "page") {
    return { body_md: text.trim(), metadata: {} };
  }

  // For structured types, extract JSON
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const metadata = JSON.parse(jsonMatch[0]);
      return { body_md: "", metadata };
    }
  } catch {
    // Fallback
  }

  // Fallback: return text as body
  return {
    body_md: text.trim(),
    metadata: cardType === "quiz"
      ? { questions: [], pass_threshold: 0.7 }
      : cardType === "scenario"
        ? { steps: [] }
        : cardType === "reflection"
          ? { prompt: text.trim() }
          : {},
  };
}
