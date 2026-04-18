/**
 * Adaptive card router — reorders cards based on learner profile.
 * Course-agnostic: works with any card set + profile combination.
 */

interface Card {
  id: string;
  card_type: string;
  title: string;
  domain: string;
  [key: string]: any;
}

interface LearnerProfile {
  domain_mastery: Record<string, number>; // { "Domain Name": 0.85, ... }
  weak_concepts: string[];
  summary_md?: string;
}

/**
 * Returns a reordered card list based on the learner's domain mastery.
 *
 * Rules:
 * 1. No profile → default order (as-is)
 * 2. Domain mastery > 0.85 → skip page cards in that domain, keep quizzes (verify mastery)
 * 3. Domain mastery < 0.5  → prioritize that domain's cards (move earlier)
 * 4. Domain mastery 0.5-0.85 → normal order
 * 5. Never skip scenario or reflection cards
 * 6. Already-completed cards stay in order but can be skipped by the learner
 */
export function getAdaptiveOrder(
  cards: Card[],
  profile: LearnerProfile | null,
  completedCards: Set<string>,
): Card[] {
  if (!profile || Object.keys(profile.domain_mastery).length === 0) {
    return cards;
  }

  const mastery = profile.domain_mastery;

  // Classify domains
  const weakDomains = new Set<string>();
  const masteredDomains = new Set<string>();

  for (const [domain, score] of Object.entries(mastery)) {
    if (score < 0.5) weakDomains.add(domain);
    else if (score > 0.85) masteredDomains.add(domain);
  }

  // If no domains need reordering, return as-is
  if (weakDomains.size === 0 && masteredDomains.size === 0) {
    return cards;
  }

  // Separate cards into buckets
  const priorityCards: Card[] = []; // Weak domain cards — go first
  const normalCards: Card[] = [];   // Normal order
  const skippedCards: Card[] = [];  // Mastered page cards — go last

  for (const card of cards) {
    const domain = card.domain ?? "";
    const isInteractive = card.card_type === "scenario" || card.card_type === "reflection";

    // Never skip interactive cards
    if (isInteractive) {
      if (weakDomains.has(domain)) {
        priorityCards.push(card);
      } else {
        normalCards.push(card);
      }
      continue;
    }

    // Mastered domain: skip page cards, keep quizzes
    if (masteredDomains.has(domain) && card.card_type === "page" && !completedCards.has(card.id)) {
      skippedCards.push(card);
      continue;
    }

    // Weak domain: prioritize
    if (weakDomains.has(domain)) {
      priorityCards.push(card);
      continue;
    }

    normalCards.push(card);
  }

  return [...priorityCards, ...normalCards, ...skippedCards];
}

/**
 * After a quiz failure, returns card IDs of related page cards
 * that should be injected back for remediation.
 */
export function getRemediationCards(
  allCards: Card[],
  failedQuizCard: Card,
): string[] {
  const quizDomain = failedQuizCard.domain;

  return allCards
    .filter(
      (c) =>
        c.card_type === "page" &&
        c.domain === quizDomain,
    )
    .map((c) => c.id);
}
