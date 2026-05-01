import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const choiceSchema = z.object({
  text: z.string().min(1),
  correct: z.boolean(),
  explanation: z.string(),
});

const questionSchema = z
  .object({
    prompt: z.string().min(1),
    choices: z.array(choiceSchema).min(3).max(6),
  })
  .refine(
    (q) => q.choices.filter((c) => c.correct).length === 1,
    {
      message: "exactly one correct choice required",
      path: ["choices"],
    },
  );

const roundSchema = z.object({
  questions: z.array(questionSchema).min(3).max(5),
});

export type PracticeChoice = z.infer<typeof choiceSchema>;
export type PracticeQuestion = z.infer<typeof questionSchema>;
export type PracticeRound = z.infer<typeof roundSchema>;

export interface MissedConcept {
  cardTitle: string;
  correctAnswer: string;
  learnerPick: string;
}

export interface BuildPromptOptions {
  domain: string;
  level: "basic" | "intermediate" | "advanced" | string;
  missedConcepts: MissedConcept[];
}

export function buildPracticePrompt(opts: BuildPromptOptions): string {
  const lines: string[] = [
    `Generate a short, ephemeral practice round (3–5 questions) on the domain: "${opts.domain}".`,
    `Audience level: ${opts.level}.`,
    `The learner just struggled on these concepts:`,
  ];
  for (const m of opts.missedConcepts.slice(0, 4)) {
    lines.push(
      `- "${m.cardTitle}" — correct answer was "${m.correctAnswer}", learner picked "${m.learnerPick}".`,
    );
  }
  lines.push(
    ``,
    `Output JSON: { "questions": [{ "prompt", "choices": [{ "text", "correct": true|false, "explanation" }] }] }.`,
    `Each question must have exactly 1 correct choice and 3–5 wrong choices. Every choice — correct or wrong — must include an explanation visible after the learner answers.`,
    `Keep questions tight: prompt under 25 words, each choice under 12.`,
  );
  return lines.join("\n");
}

export function parsePracticeOutput(input: unknown): PracticeRound {
  return roundSchema.parse(input);
}

export function validatePracticeRound(input: unknown): {
  valid: boolean;
  errors: string[];
} {
  const r = roundSchema.safeParse(input);
  if (r.success) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: r.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`),
  };
}

export async function generatePracticeRound(
  opts: BuildPromptOptions,
): Promise<PracticeRound> {
  const prompt = buildPracticePrompt(opts);
  // Single LLM call, no streaming retries. Cap is enforced by schema.
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: roundSchema,
    prompt,
  });
  return parsePracticeOutput(result.object);
}
