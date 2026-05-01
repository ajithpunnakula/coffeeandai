import { auth } from "@clerk/nextjs/server";
import { getDb } from "./db";

export interface AuthorUser {
  id: string;
  clerk_id: string;
  role: string;
  display_name: string | null;
}

export async function requireAuthor(): Promise<AuthorUser> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new AuthError("Unauthorized", 401);
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, clerk_id, role, display_name
    FROM learner.users
    WHERE clerk_id = ${clerkId}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user || !["admin", "author"].includes(user.role)) {
    throw new AuthError("Author access required", 403);
  }

  return user as AuthorUser;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
