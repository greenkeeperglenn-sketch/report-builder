"use client";

import { Section } from "@/lib/types";

interface SectionEditorProps {
  section: Section;
  onUpdate: (id: string, content: string) => void;
  onRegenerate: (id: string) => void;
  onDelete: (id: string) => void;
  isRegenerating?: boolean;
}

export default function SectionEditor({
  section,
  onUpdate,
  onRegenerate,
  onDelete,
  isRegenerating,
}: SectionEditorProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-800">{section.title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onRegenerate(section.id)}
            disabled={isRegenerating}
            className="rounded px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
          >
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(section.id)}
            className="rounded px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      <textarea
        value={section.content}
        onChange={(e) => onUpdate(section.id, e.target.value)}
        className="w-full resize-y rounded-b-lg border-0 p-4 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/20"
        rows={8}
      />
    </div>
  );
}
