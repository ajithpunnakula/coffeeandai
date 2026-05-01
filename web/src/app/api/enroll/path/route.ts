import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function getOrCreateUser(
  sql: any,
  clerkId: string,
  displayName?: string | null,
) {
  const rows =
    await sql`SELECT id, display_name FROM learner.users WHERE clerk_id = ${clerkId}`;
  if (rows.length > 0) {
    if (!rows[0].display_name && displayName) {
      await sql`UPDATE learner.users SET display_name = ${displayName} WHERE clerk_id = ${clerkId}`;
    }
    return rows[0].id;
  }
  const newRows =
    await sql`INSERT INTO learner.users (clerk_id, display_name) VALUES (${clerkId}, ${displayName ?? null}) RETURNING id`;
  return newRows[0].id;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let pathSlug: string | undefined;
    if (contentType.includes("application/json")) {
      const body = await request.json();
      pathSlug = body.pathSlug;
    } else {
      const formData = await request.formData();
      pathSlug = formData.get("pathSlug") as string | undefined;
    }
    if (!pathSlug) {
      return NextResponse.json(
        { error: "pathSlug is required" },
        { status: 400 },
      );
    }

    const sql = getDb();
    const pathRows =
      await sql`SELECT id FROM content.learning_paths WHERE slug = ${pathSlug}`;
    if (pathRows.length === 0) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }
    const pathId = pathRows[0].id;

    const user = await currentUser();
    const displayName = user?.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName.charAt(0)}.` : ""}`
      : null;
    const userId = await getOrCreateUser(sql, clerkId, displayName);

    const existing =
      await sql`SELECT user_id FROM learner.path_enrollments WHERE user_id = ${userId} AND path_id = ${pathId}`;
    if (existing.length > 0) {
      if (!contentType.includes("application/json")) {
        return NextResponse.redirect(new URL(`/paths/${pathSlug}`, request.url));
      }
      return NextResponse.json({ enrolled: true, alreadyEnrolled: true });
    }

    await sql`INSERT INTO learner.path_enrollments (user_id, path_id) VALUES (${userId}, ${pathId})`;

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL(`/paths/${pathSlug}`, request.url));
    }
    return NextResponse.json({ enrolled: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/enroll/path error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
