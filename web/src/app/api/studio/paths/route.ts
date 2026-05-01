import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import {
  createPathDraft,
  listPathDrafts,
  listPublishedPaths,
} from "@/lib/path-db";
import { slugify } from "@/lib/draft-db";

export async function GET() {
  try {
    const user = await requireAuthor();
    const [drafts, published] = await Promise.all([
      listPathDrafts(user.id),
      listPublishedPaths(),
    ]);
    return NextResponse.json({ drafts, published });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/studio/paths error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthor();
    const body = await request.json();
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }
    const slug = body.slug?.trim() || slugify(title);
    if (!slug) {
      return NextResponse.json(
        { error: "Title must produce a non-empty slug" },
        { status: 400 },
      );
    }

    const draft = await createPathDraft({
      slug,
      title,
      userId: user.id,
      summary: body.summary ?? null,
      audience: body.audience ?? null,
      level: body.level ?? null,
      tags: body.tags ?? null,
      estimated_minutes: body.estimated_minutes ?? null,
    });
    return NextResponse.json(draft, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return NextResponse.json(
        { error: "A path with this slug already exists" },
        { status: 409 },
      );
    }
    console.error("POST /api/studio/paths error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
