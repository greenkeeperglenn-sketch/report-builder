"use client";

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
  } = useLocalPrompts();

  if (!loaded) return null;

  const isModified =
    protocolPrompt !== DEFAULT_PROTOCOL_PROMPT ||
    reportPrompt !== DEFAULT_REPORT_PROMPT;

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

      <p className="text-xs text-slate-400">
        Changes are saved automatically to your browser. They will be used for
        all future generations.
      </p>
    </div>
  );
}
