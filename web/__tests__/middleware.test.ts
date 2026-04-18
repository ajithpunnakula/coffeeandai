import { describe, it, expect } from "vitest";

/**
 * Regression test: middleware must classify routes correctly.
 * The actual middleware uses Clerk's createRouteMatcher, but we test
 * the route patterns to ensure public vs protected classification.
 *
 * Bug context: auth.protect() was returning 404 instead of redirecting,
 * and /courses was incorrectly treated as protected.
 */

// Mirrors the patterns from src/middleware.ts
const publicPatterns = [
  /^\/$/,
  /^\/courses$/,
  /^\/sign-in(.*)/,
  /^\/sign-up(.*)/,
  /^\/api\/cron(.*)/,
];

function isPublicRoute(pathname: string): boolean {
  return publicPatterns.some((p) => p.test(pathname));
}

describe("route classification", () => {
  it("marks / as public", () => {
    expect(isPublicRoute("/")).toBe(true);
  });

  it("marks /courses as public", () => {
    expect(isPublicRoute("/courses")).toBe(true);
  });

  it("marks /sign-in as public", () => {
    expect(isPublicRoute("/sign-in")).toBe(true);
    expect(isPublicRoute("/sign-in/sso-callback")).toBe(true);
  });

  it("marks /sign-up as public", () => {
    expect(isPublicRoute("/sign-up")).toBe(true);
  });

  it("marks /api/cron routes as public", () => {
    expect(isPublicRoute("/api/cron/evaluate")).toBe(true);
    expect(isPublicRoute("/api/cron/profiler")).toBe(true);
  });

  it("marks /courses/slug as protected", () => {
    expect(isPublicRoute("/courses/claude-architect")).toBe(false);
  });

  it("marks /courses/slug/play as protected", () => {
    expect(isPublicRoute("/courses/claude-architect/play")).toBe(false);
  });

  it("marks /courses/slug/results as protected", () => {
    expect(isPublicRoute("/courses/claude-architect/results")).toBe(false);
  });

  it("marks /api/enroll as protected", () => {
    expect(isPublicRoute("/api/enroll")).toBe(false);
  });

  it("marks /api/progress as protected", () => {
    expect(isPublicRoute("/api/progress")).toBe(false);
  });

  it("marks /api/tutor as protected", () => {
    expect(isPublicRoute("/api/tutor")).toBe(false);
  });

  it("marks /admin as protected", () => {
    expect(isPublicRoute("/admin")).toBe(false);
  });
});
