export interface TutorContext {
  cardBody: string;
  prerequisites: string[];
  wikiRefs: string[];
  profile?: { summary: string; weak_concepts: string[] };
  history: { role: string; content: string }[];
}

export function buildSystemPrompt(ctx: TutorContext): string {
  let prompt = `You are a tutor helping a learner study for the Claude Certified Architect exam.\n\n`;
  prompt += `## Current Card\n${ctx.cardBody}\n\n`;
  if (ctx.prerequisites.length > 0) {
    prompt += `## Prerequisite Concepts\n${ctx.prerequisites.join("\n")}\n\n`;
  }
  if (ctx.wikiRefs.length > 0) {
    prompt += `## Related Wiki Content\n${ctx.wikiRefs.join("\n")}\n\n`;
  }
  if (ctx.profile) {
    prompt += `## Learner Profile\n${ctx.profile.summary}\n`;
    if (ctx.profile.weak_concepts.length > 0) {
      prompt += `Weak areas: ${ctx.profile.weak_concepts.join(", ")}\n`;
    }
    prompt += `\n`;
  }
  prompt += `Keep responses concise and focused on the current card's topic. Reference specific concepts when relevant.`;
  return prompt;
}
