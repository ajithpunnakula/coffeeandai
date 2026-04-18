import { NextResponse } from "next/server";
import { requireDeveloper, AuthError } from "@/lib/auth-guards";
import { getDraft, getDraftCards, updateDraft, deleteDraft } from "@/lib/draft-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireDeveloper();
    const { slug } = await params;
    const draft = await getDraft(slug);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    const cards = await getDraftCards(slug);
    return NextResponse.json({ ...draft, cards });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/developer/courses/[slug] error:", err);
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
    await requireDeveloper();
    const { slug } = await params;
    const body = await request.json();
    const updated = await updateDraft(slug, body);
    if (!updated) {
      return NextResponse.json({ error: "Draft not found or no valid fields" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/developer/courses/[slug] error:", err);
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
    await requireDeveloper();
    const { slug } = await params;
    const deleted = await deleteDraft(slug);
    if (!deleted) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/developer/courses/[slug] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
