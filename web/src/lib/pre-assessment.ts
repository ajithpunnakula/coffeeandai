export type Level = "basic" | "intermediate" | "advanced";

export interface AssessmentChoice {
  text: string;
  weight: number;
}

export interface AssessmentQuestion {
  prompt: string;
  choices: AssessmentChoice[];
}

export const PRE_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    prompt: "How would you describe your familiarity with this topic?",
    choices: [
      { text: "Brand new — I've barely heard of it.", weight: 0 },
      { text: "I've read a few articles or watched a tutorial.", weight: 1 },
      { text: "I've shipped one or more small projects with it.", weight: 2 },
      { text: "I work with it regularly in production.", weight: 3 },
    ],
  },
  {
    prompt: "Which best describes your typical day with this topic?",
    choices: [
      { text: "I don't use it.", weight: 0 },
      { text: "I follow tutorials or copy-paste known patterns.", weight: 1 },
      { text: "I design and debug solutions on my own.", weight: 2 },
      { text: "I review or mentor others' work.", weight: 3 },
    ],
  },
  {
    prompt: "When you hit a tricky edge case, what do you reach for?",
    choices: [
      { text: "Search the web and hope.", weight: 0 },
      { text: "Re-read the docs and try variations.", weight: 1 },
      { text: "Read the source / API reference and reason about it.", weight: 2 },
      { text: "Profile or trace, then propose a structural fix.", weight: 3 },
    ],
  },
  {
    prompt: "Which statement applies?",
    choices: [
      { text: "I want a clear introduction with everything defined.", weight: 0 },
      { text: "I have the basics; I want to apply them to real problems.", weight: 1 },
      { text: "I'm comfortable applying it; I want to compare approaches.", weight: 2 },
      { text: "I want deep dives on edge cases, performance, and tradeoffs.", weight: 3 },
    ],
  },
  {
    prompt: "What kind of mistakes do you most often make?",
    choices: [
      { text: "I get stuck on the basics — what does each piece even do?", weight: 0 },
      { text: "I miss small details when applying the patterns.", weight: 1 },
      { text: "I pick the wrong abstraction for the problem.", weight: 2 },
      { text: "I push systems past their happy path and have to redesign.", weight: 3 },
    ],
  },
];

export interface ScoreResult {
  answers: number[];
  score: number;
  level: Level;
}

const MAX_SCORE = PRE_ASSESSMENT_QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.choices.map((c) => c.weight)),
  0,
);

function scoreFromAnswers(answers: number[]): number {
  if (answers.length !== PRE_ASSESSMENT_QUESTIONS.length) {
    throw new Error(
      `pre-assessment expects ${PRE_ASSESSMENT_QUESTIONS.length} answers, got ${answers.length}`,
    );
  }
  let score = 0;
  for (let i = 0; i < answers.length; i++) {
    const q = PRE_ASSESSMENT_QUESTIONS[i];
    const idx = answers[i];
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.choices.length) {
      throw new Error(`pre-assessment answer ${i} out of range: ${idx}`);
    }
    score += q.choices[idx].weight;
  }
  return score;
}

export function recommendedLevel(answers: number[]): Level {
  const score = scoreFromAnswers(answers);
  // Tier the [0, MAX_SCORE] band into thirds.
  // basic: < 1/3, intermediate: 1/3 ≤ s < 2/3, advanced: ≥ 2/3
  const ratio = score / MAX_SCORE;
  if (ratio < 1 / 3) return "basic";
  if (ratio < 2 / 3) return "intermediate";
  return "advanced";
}

export function scoreAssessment(answers: number[]): ScoreResult {
  const score = scoreFromAnswers(answers);
  return {
    answers: [...answers],
    score,
    level: recommendedLevel(answers),
  };
}
