"use client";

import { useState } from "react";
import { PromptVersion } from "@/lib/types";

interface InlinePromptEditorProps {
  label: string;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  versions: PromptVersion[];
  onSaveVersion: (name?: string) => void;
  onRestoreVersion: (id: string) => void;
  onDeleteVersion: (id: string) => void;
  accentColor?: "emerald" | "blue";
}

export default function InlinePromptEditor({
  label,
  prompt,
  onPromptChange,
  versions,
  onSaveVersion,
  onRestoreVersion,
  onDeleteVersion,
  accentColor = "emerald",
}: InlinePromptEditorProps) {
  const [open, setOpen] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versionName, setVersionName] = useState("");

  const accent = accentColor === "blue" ? "blue" : "emerald";
  const btnClass =
    accent === "blue"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-emerald-600 hover:bg-emerald-700 text-white";
  const ringClass =
    accent === "blue"
      ? "focus:border-blue-500 focus:ring-blue-500/20"
      : "focus:border-emerald-500 focus:ring-emerald-500/20";

  const handleSaveVersion = () => {
    onSaveVersion(versionName.trim() || undefined);
    setVersionName("");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-slate-700">
          {label} Prompt Settings
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className={`h-48 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 ${ringClass}`}
          />

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Version name (e.g. V1.2)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveVersion}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${btnClass}`}
            >
              Save Version
            </button>
            <button
              type="button"
              onClick={() => setShowVersions(!showVersions)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              {showVersions ? "Hide" : "History"} ({versions.length})
            </button>
          </div>

          {showVersions && versions.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
              {[...versions].reverse().map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-0"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-700">
                      {v.name}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      {formatDate(v.date)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onRestoreVersion(v.id)}
                      className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVersion(v.id)}
                      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showVersions && versions.length === 0 && (
            <p className="mt-3 text-xs text-slate-400">
              No saved versions yet. Save a version to keep a snapshot of your current prompts.
            </p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            Changes are saved automatically. Save a version to create a named snapshot you can restore later.
          </p>
        </div>
      )}
    </div>
  );
}
