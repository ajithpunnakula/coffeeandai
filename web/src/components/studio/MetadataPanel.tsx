"use client";

interface MetadataPanelProps {
  course: {
    title: string;
    summary: string | null;
    domains: any;
    estimated_minutes: number | null;
    pass_threshold: number | null;
    exam_target: string | null;
    target_audience: string | null;
    tags: string[] | null;
  };
  onChange: (fields: Record<string, any>) => void;
}

export default function MetadataPanel({ course, onChange }: MetadataPanelProps) {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Course Settings
      </h3>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={course.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Summary</label>
        <textarea
          value={course.summary ?? ""}
          onChange={(e) => onChange({ summary: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm resize-y focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Est. Minutes
          </label>
          <input
            type="number"
            value={course.estimated_minutes ?? ""}
            onChange={(e) =>
              onChange({
                estimated_minutes: e.target.value
                  ? parseInt(e.target.value)
                  : null,
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Pass Threshold
          </label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={course.pass_threshold ?? ""}
            onChange={(e) =>
              onChange({
                pass_threshold: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Exam Target</label>
        <input
          type="text"
          value={course.exam_target ?? ""}
          onChange={(e) => onChange({ exam_target: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Target Audience
        </label>
        <input
          type="text"
          value={course.target_audience ?? ""}
          onChange={(e) => onChange({ target_audience: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>
  );
}
