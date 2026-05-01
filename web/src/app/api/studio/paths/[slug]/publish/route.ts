import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { publishPath } from "@/lib/path-db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAuthor();
    const { slug } = await params;
    const result = await publishPath(slug);
    if (!result) {
      return NextResponse.json(
        { error: "Cannot publish: path not found or has no courses" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/studio/paths/[slug]/publish error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
