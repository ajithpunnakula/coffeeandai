import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { proposePath } from "@/lib/path-proposal";

export async function POST(request: Request) {
  try {
    await requireAuthor();
    const body = await request.json().catch(() => ({}));
    const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
    if (!topic) {
      return NextResponse.json(
        { error: "topic is required" },
        { status: 400 },
      );
    }
    const audience =
      typeof body?.audience === "string" && body.audience.trim()
        ? body.audience.trim()
        : null;

    const proposal = await proposePath({ topic, audience });
    return NextResponse.json(proposal);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/studio/paths/propose error:", err);
    return NextResponse.json(
      { error: "Failed to generate proposal" },
      { status: 500 },
    );
  }
}
