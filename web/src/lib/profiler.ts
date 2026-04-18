export interface ProfileResult {
  domain_mastery: Record<string, number>;
  weak_concepts: string[];
  summary: string;
}

export function parseProfileResponse(text: string): ProfileResult | null {
  try {
    // Extract JSON from the response (may have markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate
    if (!parsed.domain_mastery || typeof parsed.domain_mastery !== "object")
      return null;
    if (!Array.isArray(parsed.weak_concepts)) return null;
    if (typeof parsed.summary !== "string") return null;

    // Validate domain scores are between 0 and 1
    for (const score of Object.values(parsed.domain_mastery)) {
      if (typeof score !== "number" || score < 0 || score > 1) return null;
    }

    return parsed as ProfileResult;
  } catch {
    return null;
  }
}

export function buildProfilerPrompt(data: {
  domainScores: Record<string, { correct: number; total: number }>;
  recentMisconceptions: string[];
  attemptPatterns: { card: string; attempts: number }[];
}): string {
  const domainSummary = Object.entries(data.domainScores)
    .map(
      ([d, s]) =>
        `${d}: ${s.correct}/${s.total} correct (${((s.correct / s.total) * 100).toFixed(0)}%)`
    )
    .join("\n");

  return `Analyze this learner's performance data and return JSON with these exact fields:
{
  "domain_mastery": {"Domain Name": 0.85, ...},
  "weak_concepts": ["concept1", "concept2"],
  "summary": "Natural language summary for tutor context..."
}

Domain scores:
${domainSummary}

Recent misconceptions triggered: ${data.recentMisconceptions.join(", ") || "none"}

Cards requiring multiple attempts: ${data.attemptPatterns.map((p) => `${p.card} (${p.attempts} attempts)`).join(", ") || "none"}`;
}
