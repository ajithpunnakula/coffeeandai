import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock DB
vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { requireDeveloper, AuthError } from "@/lib/auth-guards";

const mockAuth = vi.mocked(auth);
const mockGetDb = vi.mocked(getDb);

function mockSql(rows: any[]) {
  const sql = vi.fn().mockResolvedValue(rows) as any;
  // Tagged template literal support
  sql.mockImplementation(() => Promise.resolve(rows));
  mockGetDb.mockReturnValue(sql);
  return sql;
}

describe("requireDeveloper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    await expect(requireDeveloper()).rejects.toThrow(AuthError);
    await expect(requireDeveloper()).rejects.toMatchObject({ status: 401 });
  });

  it("throws 403 when user not found in DB", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" } as any);
    mockSql([]);

    await expect(requireDeveloper()).rejects.toThrow(AuthError);
    await expect(requireDeveloper()).rejects.toMatchObject({ status: 403 });
  });

  it("throws 403 for learner role", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" } as any);
    mockSql([{ id: "uuid-1", clerk_id: "clerk_123", role: "learner", display_name: "Test" }]);

    await expect(requireDeveloper()).rejects.toThrow(AuthError);
    await expect(requireDeveloper()).rejects.toMatchObject({ status: 403 });
  });

  it("returns user for developer role", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" } as any);
    mockSql([{ id: "uuid-1", clerk_id: "clerk_123", role: "developer", display_name: "Dev" }]);

    const user = await requireDeveloper();
    expect(user.role).toBe("developer");
    expect(user.id).toBe("uuid-1");
  });

  it("returns user for admin role", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" } as any);
    mockSql([{ id: "uuid-1", clerk_id: "clerk_123", role: "admin", display_name: "Admin" }]);

    const user = await requireDeveloper();
    expect(user.role).toBe("admin");
  });
});

describe("AuthError", () => {
  it("has correct name and status", () => {
    const err = new AuthError("test", 403);
    expect(err.name).toBe("AuthError");
    expect(err.status).toBe(403);
    expect(err.message).toBe("test");
    expect(err instanceof Error).toBe(true);
  });
});
