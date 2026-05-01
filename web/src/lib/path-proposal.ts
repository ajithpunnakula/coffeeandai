import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export type Level = "basic" | "intermediate" | "advanced";

export interface ProposedCourse {
  title: string;
  level: Level;
  position: number;
  required: boolean;
}

export interface PathProposal {
  title: string;
  summary?: string | null;
  courses: ProposedCourse[];
}

const courseSchema = z.object({
  title: z.string().min(1),
  level: z.enum(["basic", "intermediate", "advanced"]),
  required: z.boolean(),
});

// Note: every property must appear in `required` for OpenAI's structured
// output API to accept the schema. Use `.nullable()` (not `.optional()`)
// for fields that may be absent — Zod renders that as type ["string", "null"].
const proposalSchema = z.object({
  title: z.string().min(1),
  summary: z.string().nullable(),
  courses: z.array(courseSchema).min(3).max(6),
});

export function parsePathProposal(input: unknown): PathProposal {
  const parsed = proposalSchema.parse(input);
  return {
    title: parsed.title,
    summary: parsed.summary ?? null,
    courses: parsed.courses.map((c, i) => ({
      title: c.title,
      level: c.level,
      required: c.required,
      position: i + 1,
    })),
  };
}

export function validatePathProposal(input: unknown): {
  valid: boolean;
  errors: string[];
} {
  const result = proposalSchema.safeParse(input);
  if (result.success) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: result.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`),
  };
}

export interface ProposePathOptions {
  topic: string;
  audience?: string | null;
}

export async function proposePath(
  opts: ProposePathOptions,
): Promise<PathProposal> {
  const prompt = buildProposalPrompt(opts);
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: proposalSchema,
    prompt,
  });
  return parsePathProposal(result.object);
}

export function buildProposalPrompt(opts: ProposePathOptions): string {
  const audienceLine = opts.audience
    ? `Target audience: ${opts.audience}.`
    : "Audience is general practitioners.";
  return [
    `Propose a learning path for the topic: "${opts.topic}".`,
    audienceLine,
    `Output a JSON object with:`,
    `- title (string)`,
    `- summary (1–2 sentences)`,
    `- courses: 3 to 6 entries in study order, each { title, level, required }`,
    `  level ∈ {basic, intermediate, advanced}`,
    `  required is true unless the course is a deep-dive optional extension.`,
    `Pick the smallest set that meaningfully covers the topic for the audience.`,
  ].join("\n");
}
