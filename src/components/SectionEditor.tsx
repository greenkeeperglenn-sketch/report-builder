"use client";

import { useState } from "react";
import { Section } from "@/lib/types";

interface SectionEditorProps {
  section: Section;
  onUpdate: (id: string, content: string) => void;
  onRegenerate: (id: string, refinePrompt?: string) => void;
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
  const [refinePrompt, setRefinePrompt] = useState("");
  const [showRefine, setShowRefine] = useState(false);

  const handleRefine = () => {
    if (!refinePrompt.trim()) return;
    onRegenerate(section.id, refinePrompt.trim());
    setRefinePrompt("");
    setShowRefine(false);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-800">{section.title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowRefine(!showRefine)}
            className="rounded px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
            Refine
          </button>
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

      {showRefine && (
        <div className="flex gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <input
            type="text"
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRefine()}
            placeholder="e.g. Make it more concise, focus on treatment efficacy..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={handleRefine}
            disabled={isRegenerating || !refinePrompt.trim()}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      <textarea
        value={section.content}
        onChange={(e) => onUpdate(section.id, e.target.value)}
        className="w-full resize-y rounded-b-lg border-0 p-4 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/20"
        rows={8}
      />
    </div>
  );
}
