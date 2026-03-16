"use client";

import { useState } from "react";
import { useLocalPrompts } from "@/hooks/useLocalPrompts";
import { DEFAULT_PROTOCOL_PROMPT, DEFAULT_REPORT_PROMPT } from "@/lib/prompts";

export default function AdminPromptEditor() {
  const {
    protocolPrompt,
    reportPrompt,
    saveProtocolPrompt,
    saveReportPrompt,
    resetToDefaults,
    loaded,
    versions,
    saveVersion,
    restoreVersion,
    deleteVersion,
  } = useLocalPrompts();

  const [versionName, setVersionName] = useState("");

  if (!loaded) return null;

  const isModified =
    protocolPrompt !== DEFAULT_PROTOCOL_PROMPT ||
    reportPrompt !== DEFAULT_REPORT_PROMPT;

  const handleSaveVersion = () => {
    saveVersion(versionName.trim() || undefined);
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          AI Prompt Editor
        </h2>
        {isModified && (
          <button
            type="button"
            onClick={resetToDefaults}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Protocol Generation Prompt
        </label>
        <textarea
          value={protocolPrompt}
          onChange={(e) => saveProtocolPrompt(e.target.value)}
          className="h-64 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Report Generation Prompt
        </label>
        <textarea
          value={reportPrompt}
          onChange={(e) => saveReportPrompt(e.target.value)}
          className="h-64 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Version Management */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          Prompt Versions
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="Version name (e.g. V1.2)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveVersion}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Save Version
          </button>
        </div>

        {versions.length > 0 && (
          <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {[...versions].reverse().map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-700">
                    {v.name}
                  </span>
                  <span className="ml-3 text-xs text-slate-400">
                    {formatDate(v.date)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => restoreVersion(v.id)}
                    className="rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteVersion(v.id)}
                    className="rounded px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {versions.length === 0 && (
          <p className="mt-2 text-xs text-slate-400">
            No saved versions. Save a version to create a named snapshot you can restore later.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Changes are saved automatically to your browser. They will be used for
        all future generations. Save versions to keep snapshots you can revisit.
      </p>
    </div>
  );
}
