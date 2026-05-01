"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

interface LibraryCourse {
  slug: string;
  title: string;
  summary: string | null;
  estimated_minutes: number | null;
  level: string | null;
}

interface BuilderCourse extends LibraryCourse {
  position: number;
  required: boolean;
  course_slug: string;
}

interface PathMeta {
  title: string;
  summary: string | null;
  audience: string | null;
  level: string | null;
  estimated_minutes: number | null;
}

interface Props {
  slug: string;
  initialPath: PathMeta;
  initialCourses: BuilderCourse[];
  library: LibraryCourse[];
}

function levelLabel(l: string | null) {
  if (!l) return null;
  return l.charAt(0).toUpperCase() + l.slice(1);
}

export default function PathBuilder({
  slug,
  initialPath,
  initialCourses,
  library,
}: Props) {
  const [path, setPath] = useState<PathMeta>(initialPath);
  const [courses, setCourses] = useState<BuilderCourse[]>(
    initialCourses.slice().sort((a, b) => a.position - b.position),
  );
  const [filter, setFilter] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const totalMinutes = useMemo(
    () =>
      courses.reduce((sum, c) => sum + (Number(c.estimated_minutes) || 0), 0),
    [courses],
  );

  const inPath = useMemo(
    () => new Set(courses.map((c) => c.course_slug)),
    [courses],
  );

  const filteredLibrary = library.filter(
    (c) =>
      !inPath.has(c.slug) &&
      (filter.length === 0 ||
        c.title.toLowerCase().includes(filter.toLowerCase()) ||
        (c.level ?? "").toLowerCase().includes(filter.toLowerCase())),
  );

  // Debounced auto-save.
  useEffect(() => {
    const id = setTimeout(async () => {
      await save();
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, courses]);

  async function save() {
    const body = {
      title: path.title,
      summary: path.summary,
      audience: path.audience,
      level: path.level,
      estimated_minutes: totalMinutes,
      courses: courses.map((c, i) => ({
        course_slug: c.course_slug,
        required: c.required,
        position: i + 1,
      })),
    };
    const res = await fetch(`/api/studio/paths/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) setSavedAt(new Date());
  }

  function addToPath(c: LibraryCourse) {
    setCourses((prev) => [
      ...prev,
      {
        ...c,
        course_slug: c.slug,
        position: prev.length + 1,
        required: true,
      },
    ]);
  }

  function removeFromPath(slug: string) {
    setCourses((prev) => prev.filter((c) => c.course_slug !== slug));
  }

  function toggleRequired(slug: string) {
    setCourses((prev) =>
      prev.map((c) =>
        c.course_slug === slug ? { ...c, required: !c.required } : c,
      ),
    );
  }

  function moveCourse(from: number, to: number) {
    setCourses((prev) => {
      if (from === to) return prev;
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((c, i) => ({ ...c, position: i + 1 }));
    });
  }

  async function handlePublish() {
    setPublishing(true);
    await save();
    const res = await fetch(`/api/studio/paths/${slug}/publish`, {
      method: "POST",
    });
    setPublishing(false);
    if (res.ok) {
      const data = await res.json();
      setPublishedSlug(data.slug ?? slug);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? `Publish failed: HTTP ${res.status}`);
    }
  }

  if (publishedSlug) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-3">Published.</h1>
        <p className="text-gray-400 mb-6">
          Your path is live. Learners can find it at /paths/{publishedSlug}.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={`/paths/${publishedSlug}`}
            className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
          >
            View as learner
          </Link>
          <Link
            href="/studio/paths"
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            Back to paths
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/studio/paths"
          className="text-sm text-gray-500 hover:text-gray-300"
        >
          ← Paths
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {savedAt
              ? `Saved ${savedAt.toLocaleTimeString()}`
              : "Auto-save…"}
          </span>
          <button
            onClick={handlePublish}
            disabled={publishing || courses.length === 0}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-gray-900 font-semibold hover:bg-emerald-400 disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr,280px] gap-4">
        <aside className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Course library
          </h3>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
            className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <div className="space-y-2" data-pathbuilder="library">
            {filteredLibrary.map((c) => (
              <button
                key={c.slug}
                onClick={() => addToPath(c)}
                className="w-full text-left rounded-lg border border-gray-800 bg-gray-900/50 p-3 hover:border-gray-700 hover:bg-gray-900 transition"
              >
                <div className="text-sm font-medium text-gray-200 line-clamp-1">
                  {c.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  {c.level && (
                    <span data-level-pill={c.level}>{levelLabel(c.level)}</span>
                  )}
                  {c.estimated_minutes != null && (
                    <span>{c.estimated_minutes} min</span>
                  )}
                </div>
              </button>
            ))}
            {filteredLibrary.length === 0 && (
              <p className="text-xs text-gray-500">No matching courses.</p>
            )}
          </div>
        </aside>

        <section
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
          data-pathbuilder="ordered-list"
        >
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Path order
            </h3>
            <span className="text-xs text-gray-500">
              {courses.length} course{courses.length === 1 ? "" : "s"} ·{" "}
              {totalMinutes} min total
            </span>
          </header>
          {courses.length === 0 && (
            <p className="text-sm text-gray-500">
              Drag or click courses from the left to add them to this path.
            </p>
          )}
          <ol className="space-y-2">
            {courses.map((c, i) => (
              <li
                key={c.course_slug}
                draggable
                onDragStart={() => {
                  dragIndex.current = i;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex.current != null) {
                    moveCourse(dragIndex.current, i);
                    dragIndex.current = null;
                  }
                }}
                className="rounded-lg border border-gray-800 bg-gray-900 p-3 flex items-center gap-3 cursor-grab"
                data-course-slug={c.course_slug}
              >
                <span className="text-xs text-gray-500 tabular-nums w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 line-clamp-1">
                    {c.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    {c.level && (
                      <span data-level-pill={c.level}>
                        {levelLabel(c.level)}
                      </span>
                    )}
                    {c.estimated_minutes != null && (
                      <span>{c.estimated_minutes} min</span>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={c.required}
                    onChange={() => toggleRequired(c.course_slug)}
                  />
                  Required
                </label>
                <button
                  onClick={() => removeFromPath(c.course_slug)}
                  className="text-xs text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        </section>

        <aside className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Path details
          </h3>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={path.title}
              onChange={(e) => setPath({ ...path, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Summary</label>
            <textarea
              value={path.summary ?? ""}
              onChange={(e) =>
                setPath({ ...path, summary: e.target.value || null })
              }
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Audience</label>
            <input
              type="text"
              value={path.audience ?? ""}
              onChange={(e) =>
                setPath({ ...path, audience: e.target.value || null })
              }
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Level</label>
            <select
              value={path.level ?? ""}
              onChange={(e) =>
                setPath({ ...path, level: e.target.value || null })
              }
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">—</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </aside>
      </div>
    </main>
  );
}
