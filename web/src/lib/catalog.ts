export type CatalogLevel = "basic" | "intermediate" | "advanced" | null;

export interface CatalogCourse {
  id: string;
  slug: string;
  title: string;
  summary: string | null | undefined;
  estimated_minutes: number | null | undefined;
  pass_threshold: number | null | undefined;
  domains: Array<{ name: string; weight: number }> | null | undefined;
  card_count: number;
  level: CatalogLevel;
  topic_key: string | null;
}

export interface CatalogTile {
  topic_key: string | null;
  title: string;
  summary: string | null | undefined;
  domains: Array<{ name: string; weight: number }> | null | undefined;
  estimated_minutes: number | null | undefined;
  card_count: number;
  levels: Array<{
    level: CatalogLevel;
    slug: string;
    title: string;
    estimated_minutes: number | null | undefined;
    card_count: number;
  }>;
}

const LEVEL_ORDER: Record<string, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
};

export function groupCoursesByTopic(courses: CatalogCourse[]): CatalogTile[] {
  const groupedByKey = new Map<string, CatalogCourse[]>();
  const ungrouped: CatalogCourse[] = [];

  for (const c of courses) {
    if (c.topic_key) {
      const arr = groupedByKey.get(c.topic_key) ?? [];
      arr.push(c);
      groupedByKey.set(c.topic_key, arr);
    } else {
      ungrouped.push(c);
    }
  }

  const tiles: CatalogTile[] = [];

  for (const [topicKey, group] of groupedByKey) {
    const levels = group
      .slice()
      .sort(
        (a, b) =>
          (LEVEL_ORDER[a.level ?? ""] ?? 99) -
          (LEVEL_ORDER[b.level ?? ""] ?? 99),
      )
      .map((c) => ({
        level: c.level,
        slug: c.slug,
        title: c.title,
        estimated_minutes: c.estimated_minutes,
        card_count: c.card_count,
      }));

    const primary = group[0];
    tiles.push({
      topic_key: topicKey,
      title: stripLevelSuffix(primary.title),
      summary: primary.summary,
      domains: primary.domains,
      estimated_minutes: primary.estimated_minutes,
      card_count: primary.card_count,
      levels,
    });
  }

  for (const c of ungrouped) {
    tiles.push({
      topic_key: null,
      title: c.title,
      summary: c.summary,
      domains: c.domains,
      estimated_minutes: c.estimated_minutes,
      card_count: c.card_count,
      levels: [
        {
          level: c.level,
          slug: c.slug,
          title: c.title,
          estimated_minutes: c.estimated_minutes,
          card_count: c.card_count,
        },
      ],
    });
  }

  return tiles;
}

function stripLevelSuffix(title: string): string {
  return title.replace(/\s*[—-]\s*(Basic|Intermediate|Advanced)$/i, "");
}
