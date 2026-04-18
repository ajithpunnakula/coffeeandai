import { auth } from "@clerk/nextjs/server";
import { getDb } from "./db";

export interface DeveloperUser {
  id: string;
  clerk_id: string;
  role: string;
  display_name: string | null;
}

export async function requireDeveloper(): Promise<DeveloperUser> {
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
  if (!user || !["admin", "developer"].includes(user.role)) {
    throw new AuthError("Developer access required", 403);
  }

  return user as DeveloperUser;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
