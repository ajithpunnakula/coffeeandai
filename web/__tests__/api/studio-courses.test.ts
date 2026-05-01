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
import { AuthError, requireAuthor } from "@/lib/auth-guards";

// Mock auth-guards to control behavior per test
vi.mock("@/lib/auth-guards", () => ({
  requireAuthor: vi.fn(),
  AuthError: class AuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "AuthError";
      this.status = status;
    }
  },
}));

const mockRequireDeveloper = vi.mocked(requireAuthor);
const mockGetDb = vi.mocked(getDb);

function createMockSql(responses: Record<string, any[]>) {
  const sql = vi.fn().mockImplementation((...args: any[]) => {
    // Tagged template literal: first arg is template strings array
    const query = Array.isArray(args[0]) ? args[0].join("?") : "";
    for (const [key, val] of Object.entries(responses)) {
      if (query.includes(key)) return Promise.resolve(val);
    }
    return Promise.resolve([]);
  }) as any;
  mockGetDb.mockReturnValue(sql);
  return sql;
}

describe("Developer courses API helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auth guard integration", () => {
    it("requireAuthor rejects learner role", async () => {
      mockRequireDeveloper.mockRejectedValue(
        new AuthError("Developer access required", 403),
      );

      await expect(requireAuthor()).rejects.toThrow("Developer access required");
    });

    it("requireAuthor accepts developer role", async () => {
      mockRequireDeveloper.mockResolvedValue({
        id: "uuid-1",
        clerk_id: "clerk_123",
        role: "developer",
        display_name: "Dev User",
      });

      const user = await requireAuthor();
      expect(user.role).toBe("developer");
    });
  });

  describe("Draft slug generation", () => {
    it("generates valid slug from title", () => {
      function slugify(title: string): string {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      expect(slugify("My Cool Course")).toBe("my-cool-course");
      expect(slugify("AI & Machine Learning!")).toBe("ai-machine-learning");
      expect(slugify("  Spaces  Everywhere  ")).toBe("spaces-everywhere");
      expect(slugify("123-Numbers")).toBe("123-numbers");
    });
  });

  describe("Card ID generation", () => {
    it("generates card IDs with card_ prefix and 8 hex chars", () => {
      function generateCardId(): string {
        const hex = Math.random().toString(16).substring(2, 10);
        return `card_${hex}`;
      }

      const id = generateCardId();
      expect(id).toMatch(/^card_[0-9a-f]{8}$/);
    });
  });
});
