export type SectionType = "concept" | "code" | "keypoints" | "examtip" | "comparison";

export interface Section {
  type: SectionType;
  heading: string | null;
  bodyMd: string;
  codeBlock?: string;
  codeLang?: string;
  items?: string[];
}

/**
 * Split a card's body_md into typed sections by H2 boundaries.
 * Each section becomes a micro-slide in the PageCard player.
 */
export function splitSections(bodyMd: string, cardTitle: string): Section[] {
  // Strip [[wikilinks]] → plain text
  const cleaned = bodyMd.replace(/\[\[([^\]]+)\]\]/g, "$1");
  const lines = cleaned.split("\n");
  const rawSections: { heading: string | null; lines: string[] }[] = [];

  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    // Skip redundant H1 that matches card title
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      const h1Text = line.replace(/^#\s+/, "").trim();
      if (isSimilar(h1Text, cardTitle)) continue;
      // Non-matching H1: treat as content
      currentLines.push(line);
      continue;
    }

    if (line.startsWith("## ")) {
      // Flush previous section
      if (currentLines.length > 0 || rawSections.length === 0) {
        rawSections.push({ heading: currentHeading, lines: [...currentLines] });
      }
      currentHeading = line.replace(/^##\s+/, "").trim();
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  // Flush last section
  if (currentLines.length > 0 || rawSections.length > 0) {
    rawSections.push({ heading: currentHeading, lines: [...currentLines] });
  }

  // Remove empty intro section (no heading, no content)
  const sections = rawSections.filter(
    (s) => s.heading !== null || s.lines.some((l) => l.trim().length > 0),
  );

  // If no H2 splits found, return single concept section
  if (sections.length === 0) {
    return [{ type: "concept", heading: null, bodyMd: bodyMd.trim() }];
  }

  // Further split sections that contain code blocks into separate slides
  const expanded = expandCodeBlocks(sections);

  return expanded.map(classifySection);
}

/**
 * If a section contains a fenced code block alongside prose,
 * split it so the code block becomes its own section.
 */
function expandCodeBlocks(
  sections: { heading: string | null; lines: string[] }[],
): { heading: string | null; lines: string[] }[] {
  const result: { heading: string | null; lines: string[] }[] = [];

  for (const section of sections) {
    const codeBlockRanges = findCodeBlockRanges(section.lines);

    if (codeBlockRanges.length === 0) {
      result.push(section);
      continue;
    }

    // Check if the section is ONLY a code block (with maybe a few lines of context)
    const nonCodeLines = section.lines.filter((_, i) =>
      !codeBlockRanges.some((r) => i >= r.start && i <= r.end),
    ).filter((l) => l.trim().length > 0);

    if (nonCodeLines.length <= 2) {
      // Mostly code — keep as one section
      result.push(section);
      continue;
    }

    // Split: prose before first code block, then code block, then rest
    let cursor = 0;
    for (const range of codeBlockRanges) {
      // Prose before this code block
      const proseLines = section.lines.slice(cursor, range.start);
      if (proseLines.some((l) => l.trim().length > 0)) {
        result.push({
          heading: cursor === 0 ? section.heading : null,
          lines: proseLines,
        });
      }
      // The code block itself
      result.push({
        heading: cursor === 0 && !proseLines.some((l) => l.trim().length > 0)
          ? section.heading
          : null,
        lines: section.lines.slice(range.start, range.end + 1),
      });
      cursor = range.end + 1;
    }
    // Remaining prose after last code block
    const remainingLines = section.lines.slice(cursor);
    if (remainingLines.some((l) => l.trim().length > 0)) {
      result.push({ heading: null, lines: remainingLines });
    }
  }

  return result;
}

function findCodeBlockRanges(lines: string[]): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trimStart().startsWith("```")) {
      const start = i;
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        i++;
      }
      ranges.push({ start, end: i });
    }
    i++;
  }
  return ranges;
}

function classifySection(section: {
  heading: string | null;
  lines: string[];
}): Section {
  const body = section.lines.join("\n").trim();
  const heading = section.heading;
  const headingLower = (heading ?? "").toLowerCase();

  // Check for code block
  const codeMatch = body.match(/```(\w*)\n([\s\S]*?)```/);
  if (codeMatch) {
    const nonCodeText = body.replace(/```\w*\n[\s\S]*?```/g, "").trim();
    return {
      type: "code",
      heading,
      bodyMd: nonCodeText,
      codeBlock: codeMatch[2].trimEnd(),
      codeLang: codeMatch[1] || undefined,
    };
  }

  // Check for exam tip
  if (
    headingLower.includes("exam tip") ||
    headingLower.includes("exam tests") ||
    headingLower.includes("key points") ||
    body.toLowerCase().includes("exam tip") ||
    (headingLower.includes("exam") && hasListItems(body))
  ) {
    return {
      type: "examtip",
      heading,
      bodyMd: stripListItems(body),
      items: extractListItems(body),
    };
  }

  // Check for comparison / anti-pattern
  if (
    headingLower.includes("anti-pattern") ||
    headingLower.includes("vs") ||
    headingLower.includes("comparison") ||
    headingLower.includes("don't") ||
    headingLower.includes("correct approach") ||
    headingLower.includes("do/don't")
  ) {
    return {
      type: "comparison",
      heading,
      bodyMd: body,
    };
  }

  // Check for keypoints (majority of lines are list items)
  const nonEmptyLines = section.lines.filter((l) => l.trim().length > 0);
  const listLines = nonEmptyLines.filter(
    (l) => /^\s*[-*]\s/.test(l) || /^\s*\d+\.\s/.test(l),
  );
  if (nonEmptyLines.length > 0 && listLines.length / nonEmptyLines.length > 0.4) {
    return {
      type: "keypoints",
      heading,
      bodyMd: stripListItems(body),
      items: extractListItems(body),
    };
  }

  // Default: concept
  return {
    type: "concept",
    heading,
    bodyMd: body,
  };
}

function hasListItems(text: string): boolean {
  return text.split("\n").some((l) => /^\s*[-*]\s/.test(l) || /^\s*\d+\.\s/.test(l));
}

function extractListItems(text: string): string[] {
  return text
    .split("\n")
    .filter((l) => /^\s*[-*]\s/.test(l) || /^\s*\d+\.\s/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, "").replace(/^\s*\d+\.\s+/, "").trim());
}

function stripListItems(text: string): string {
  return text
    .split("\n")
    .filter((l) => !/^\s*[-*]\s/.test(l) && !/^\s*\d+\.\s/.test(l))
    .join("\n")
    .trim();
}

function isSimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalize(a) === normalize(b) || normalize(a).includes(normalize(b)) || normalize(b).includes(normalize(a));
}
