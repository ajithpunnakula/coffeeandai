import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import {
  listDrafts,
  listPublished,
  createEmptyDraft,
  clonePublishedToDraft,
  slugify,
} from "@/lib/draft-db";

export async function GET() {
  try {
    const user = await requireAuthor();
    const [drafts, published] = await Promise.all([
      listDrafts(user.id),
      listPublished(),
    ]);
    return NextResponse.json({ drafts, published });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/studio/courses error:", err);
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

    if (body.cloneFrom) {
      // Clone from published course
      const draft = await clonePublishedToDraft(body.cloneFrom, user.id);
      if (!draft) {
        return NextResponse.json(
          { error: "Published course not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(draft, { status: 201 });
    }

    // Create empty draft
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    const slug = slugify(title);
    if (!slug) {
      return NextResponse.json(
        { error: "Title must contain alphanumeric characters" },
        { status: 400 },
      );
    }

    const draft = await createEmptyDraft(title, slug, user.id);
    return NextResponse.json(draft, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Handle unique constraint violation for slug
    if (
      err instanceof Error &&
      err.message.includes("unique")
    ) {
      return NextResponse.json(
        { error: "A course with this slug already exists" },
        { status: 409 },
      );
    }
    console.error("POST /api/studio/courses error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
