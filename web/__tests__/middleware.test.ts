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

  it("marks /developer as protected", () => {
    expect(isPublicRoute("/studio")).toBe(false);
  });

  it("marks /api/studio routes as protected", () => {
    expect(isPublicRoute("/api/studio/courses")).toBe(false);
    expect(isPublicRoute("/api/studio/cards")).toBe(false);
  });
});

/**
 * Mirrors the matcher regex from src/middleware.ts. The matcher decides whether
 * Clerk's middleware runs at all — paths it excludes never reach Clerk.
 *
 * Bug context (Sentry COFFEEANDAI-3): a crawler hit /robots.txt with a
 * truncated __clerk_handshake query param. Because the matcher did not exclude
 * /robots.txt or /sitemap.xml, Clerk attempted JWT verification on the
 * malformed token and threw "Invalid JWT form".
 */
const matcherRegex =
  /^\/(?!_next\/static|_next\/image|favicon\.ico|robots\.txt|sitemap\.xml|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*/;

function matcherRuns(pathname: string): boolean {
  return matcherRegex.test(pathname);
}

describe("middleware matcher excludes crawler metadata routes", () => {
  it("does not run on /robots.txt", () => {
    expect(matcherRuns("/robots.txt")).toBe(false);
  });

  it("does not run on /sitemap.xml", () => {
    expect(matcherRuns("/sitemap.xml")).toBe(false);
  });

  it("does not run on /favicon.ico", () => {
    expect(matcherRuns("/favicon.ico")).toBe(false);
  });

  it("does not run on static assets", () => {
    expect(matcherRuns("/logo.svg")).toBe(false);
    expect(matcherRuns("/_next/static/chunks/main.js")).toBe(false);
    expect(matcherRuns("/_next/image")).toBe(false);
  });

  it("still runs on app routes", () => {
    expect(matcherRuns("/")).toBe(true);
    expect(matcherRuns("/courses")).toBe(true);
    expect(matcherRuns("/api/enroll")).toBe(true);
  });
});
