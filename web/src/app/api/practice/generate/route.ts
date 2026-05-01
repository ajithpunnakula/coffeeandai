import { NextResponse } from "next/server";
import { generatePracticeRound } from "@/lib/practice-generator";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as {
    domain?: unknown;
    level?: unknown;
    missedConcepts?: unknown;
  };
  const domain = typeof b.domain === "string" && b.domain.trim() ? b.domain.trim() : null;
  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }
  const level = typeof b.level === "string" && b.level.trim() ? b.level.trim() : "intermediate";
  const missedConcepts = Array.isArray(b.missedConcepts)
    ? b.missedConcepts
        .filter(
          (m): m is { cardTitle: string; correctAnswer: string; learnerPick: string } =>
            !!m &&
            typeof (m as { cardTitle?: unknown }).cardTitle === "string" &&
            typeof (m as { correctAnswer?: unknown }).correctAnswer === "string" &&
            typeof (m as { learnerPick?: unknown }).learnerPick === "string",
        )
        .slice(0, 6)
    : [];

  try {
    const round = await generatePracticeRound({ domain, level, missedConcepts });
    return NextResponse.json(round);
  } catch (err) {
    console.error("POST /api/practice/generate error:", err);
    return NextResponse.json(
      { error: "Failed to generate practice round" },
      { status: 500 },
    );
  }
}
