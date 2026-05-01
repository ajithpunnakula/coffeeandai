import { describe, it, expect } from "vitest";
import {
  computePathGating,
  isPathComplete,
  type PathCourse,
  type CourseProgressMap,
} from "@/lib/path-gating";

const c = (
  id: string,
  position: number,
  required = true,
): PathCourse => ({
  course_id: id,
  course_slug: id,
  position,
  required,
});

describe("Phase 3 — path gating", () => {
  describe("computePathGating", () => {
    it("first required course is always unlocked", () => {
      const courses = [c("a", 1), c("b", 2), c("c", 3)];
      const progress: CourseProgressMap = {};
      const gates = computePathGating(courses, progress);
      expect(gates[0]).toMatchObject({ course_slug: "a", locked: false });
    });

    it("subsequent required course is locked until prior required is complete", () => {
      const courses = [c("a", 1), c("b", 2), c("c", 3)];
      const progress: CourseProgressMap = { a: { complete: false } };
      const gates = computePathGating(courses, progress);
      expect(gates[1]).toMatchObject({ course_slug: "b", locked: true });
      expect(gates[2]).toMatchObject({ course_slug: "c", locked: true });
    });

    it("completing a required course unlocks the next required course", () => {
      const courses = [c("a", 1), c("b", 2), c("c", 3)];
      const progress: CourseProgressMap = { a: { complete: true } };
      const gates = computePathGating(courses, progress);
      expect(gates[1]).toMatchObject({ course_slug: "b", locked: false });
      expect(gates[2]).toMatchObject({ course_slug: "c", locked: true });
    });

    it("optional courses do NOT gate later required courses", () => {
      const courses = [c("a", 1, true), c("b", 2, false), c("c", 3, true)];
      const progress: CourseProgressMap = { a: { complete: true } };
      const gates = computePathGating(courses, progress);
      // 'b' is optional and unlocked once 'a' is done.
      expect(gates[1]).toMatchObject({ course_slug: "b", locked: false });
      // 'c' is required; gated only by previous *required* completions (only 'a').
      expect(gates[2]).toMatchObject({ course_slug: "c", locked: false });
    });

    it("optional courses unlock independently of completion of prior optional courses", () => {
      const courses = [c("a", 1, false), c("b", 2, false)];
      const progress: CourseProgressMap = {};
      const gates = computePathGating(courses, progress);
      expect(gates[0]).toMatchObject({ course_slug: "a", locked: false });
      expect(gates[1]).toMatchObject({ course_slug: "b", locked: false });
    });

    it("respects position order, not array order", () => {
      const courses = [c("c", 3), c("a", 1), c("b", 2)];
      const progress: CourseProgressMap = { a: { complete: true } };
      const gates = computePathGating(courses, progress);
      expect(gates.map((g) => g.course_slug)).toEqual(["a", "b", "c"]);
      expect(gates[1]).toMatchObject({ course_slug: "b", locked: false });
    });
  });

  describe("isPathComplete", () => {
    it("returns false when no progress", () => {
      const courses = [c("a", 1), c("b", 2)];
      expect(isPathComplete(courses, {})).toBe(false);
    });

    it("returns true when all required courses complete", () => {
      const courses = [c("a", 1, true), c("b", 2, true)];
      const progress: CourseProgressMap = {
        a: { complete: true },
        b: { complete: true },
      };
      expect(isPathComplete(courses, progress)).toBe(true);
    });

    it("returns true when all required complete and an optional is not complete", () => {
      const courses = [c("a", 1, true), c("b", 2, false)];
      const progress: CourseProgressMap = { a: { complete: true } };
      expect(isPathComplete(courses, progress)).toBe(true);
    });

    it("returns false when one required is incomplete", () => {
      const courses = [c("a", 1, true), c("b", 2, true)];
      const progress: CourseProgressMap = { a: { complete: true } };
      expect(isPathComplete(courses, progress)).toBe(false);
    });

    it("path with only optional courses is complete on creation", () => {
      const courses = [c("a", 1, false)];
      expect(isPathComplete(courses, {})).toBe(true);
    });
  });
});
