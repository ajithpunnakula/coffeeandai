export interface PathCourse {
  course_id: string;
  course_slug: string;
  position: number;
  required: boolean;
}

export type CourseProgressMap = Record<string, { complete: boolean }>;

export interface CourseGate {
  course_slug: string;
  course_id: string;
  position: number;
  required: boolean;
  locked: boolean;
  complete: boolean;
}

function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.position - b.position);
}

export function computePathGating(
  courses: PathCourse[],
  progress: CourseProgressMap,
): CourseGate[] {
  const ordered = sortByPosition(courses);
  const gates: CourseGate[] = [];
  let priorRequiredAllComplete = true;

  for (const c of ordered) {
    const complete = !!progress[c.course_slug]?.complete;
    const locked = c.required ? !priorRequiredAllComplete : false;
    gates.push({
      course_slug: c.course_slug,
      course_id: c.course_id,
      position: c.position,
      required: c.required,
      locked,
      complete,
    });
    if (c.required && !complete) priorRequiredAllComplete = false;
  }

  return gates;
}

export function isPathComplete(
  courses: PathCourse[],
  progress: CourseProgressMap,
): boolean {
  return courses
    .filter((c) => c.required)
    .every((c) => !!progress[c.course_slug]?.complete);
}
