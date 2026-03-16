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

/** Check if content contains a markdown table */
function hasMarkdownTable(content: string): boolean {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes("|") && /^[\s|:-]+$/.test(lines[i + 1])) return true;
  }
  return false;
}

/** Render content with markdown tables converted to HTML tables */
function renderContentWithTables(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    if (
      lines[i].includes("|") &&
      i + 1 < lines.length &&
      /^[\s|:-]+$/.test(lines[i + 1])
    ) {
      const parseLine = (l: string) =>
        l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const headers = parseLine(lines[i]);
      const tableRows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].includes("|") && lines[j].trim() !== "") {
        tableRows.push(parseLine(lines[j]));
        j++;
      }
      elements.push(
        <div key={key++} className="my-2 overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-blue-50">
                {headers.map((h, hi) => (
                  <th key={hi} className="border-b border-slate-200 px-3 py-1.5 text-left font-semibold text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? "bg-slate-50" : ""}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-slate-100 px-3 py-1.5 text-slate-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = j;
      continue;
    }
    if (lines[i].trim()) {
      elements.push(<p key={key++} className="text-sm leading-relaxed text-slate-700">{lines[i]}</p>);
    } else {
      elements.push(<div key={key++} className="h-2" />);
    }
    i++;
  }
  return elements;
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
  const contentHasTable = hasMarkdownTable(section.content);
  const [editing, setEditing] = useState(false);

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
          {contentHasTable && (
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="rounded px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              {editing ? "Preview" : "Edit"}
            </button>
          )}
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

      {contentHasTable && !editing ? (
        <div className="p-4">{renderContentWithTables(section.content)}</div>
      ) : (
        <textarea
          value={section.content}
          onChange={(e) => onUpdate(section.id, e.target.value)}
          className="w-full resize-y rounded-b-lg border-0 p-4 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/20"
          rows={8}
        />
      )}
    </div>
  );
}
