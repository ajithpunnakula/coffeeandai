import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

async function getOrCreateUser(sql: any, clerkId: string) {
  const rows =
    await sql`SELECT id FROM learner.users WHERE clerk_id = ${clerkId}`;
  if (rows.length > 0) return rows[0].id;
  const newRows =
    await sql`INSERT INTO learner.users (clerk_id) VALUES (${clerkId}) RETURNING id`;
  return newRows[0].id;
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let courseSlug: string | undefined;
    if (contentType.includes("application/json")) {
      const body = await request.json();
      courseSlug = body.courseSlug;
    } else {
      const formData = await request.formData();
      courseSlug = formData.get("courseSlug") as string | undefined;
    }
    if (!courseSlug) {
      return NextResponse.json(
        { error: "courseSlug is required" },
        { status: 400 },
      );
    }

    const sql = getDb();
    const userId = await getOrCreateUser(sql, clerkId);

    const existing =
      await sql`SELECT user_id FROM learner.enrollments WHERE user_id = ${userId} AND course_slug = ${courseSlug}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Already enrolled" },
        { status: 409 },
      );
    }

    await sql`INSERT INTO learner.enrollments (user_id, course_slug) VALUES (${userId}, ${courseSlug})`;

    // If form submission, redirect back to course page
    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL(`/courses/${courseSlug}`, request.url));
    }

    return NextResponse.json({ enrolled: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/enroll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
