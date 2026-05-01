import { NextResponse } from "next/server";
import { requireAuthor, AuthError } from "@/lib/auth-guards";
import {
  getPathDraft,
  getPathDraftCourses,
  setPathCourses,
  updatePathDraft,
  deletePathDraft,
} from "@/lib/path-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAuthor();
    const { slug } = await params;
    const draft = await getPathDraft(slug);
    if (!draft) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }
    const courses = await getPathDraftCourses(slug);
    return NextResponse.json({ ...draft, courses });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/studio/paths/[slug] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAuthor();
    const { slug } = await params;
    const body = await request.json();
    if (Array.isArray(body.courses)) {
      const ok = await setPathCourses(
        slug,
        body.courses.map((c: { course_slug: string; required?: boolean }) => ({
          course_slug: String(c.course_slug),
          required: c.required !== false,
        })),
      );
      if (!ok) {
        return NextResponse.json({ error: "Path not found" }, { status: 404 });
      }
    }
    const updated = await updatePathDraft(slug, body);
    if (updated == null && !Array.isArray(body.courses)) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }
    const fresh = await getPathDraft(slug);
    const courses = await getPathDraftCourses(slug);
    return NextResponse.json({ ...fresh, courses });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/studio/paths/[slug] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAuthor();
    const { slug } = await params;
    const deleted = await deletePathDraft(slug);
    if (!deleted) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/studio/paths/[slug] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
