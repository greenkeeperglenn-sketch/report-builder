"use client";

import { useState } from "react";
import Link from "next/link";
import { Section } from "@/lib/types";
import { useLocalPrompts } from "@/hooks/useLocalPrompts";
import NotesInput from "@/components/NotesInput";
import FileUploader from "@/components/FileUploader";
import SectionList from "@/components/SectionList";
import SectionOrderPanel from "@/components/SectionOrderPanel";
import InlinePromptEditor from "@/components/InlinePromptEditor";
import BottomBar from "@/components/BottomBar";

export default function ProtocolPage() {
  const [notes, setNotes] = useState("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    protocolPrompt,
    saveProtocolPrompt,
    loaded,
    versions,
    saveVersion,
    restoreVersion,
    deleteVersion,
  } = useLocalPrompts();

  const handleGenerate = async () => {
    if (!notes.trim() && additionalFiles.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("notes", notes);
      if (protocolPrompt) formData.append("customPrompt", protocolPrompt);
      for (const file of additionalFiles) {
        formData.append("additionalFiles", file);
      }

      const res = await fetch("/api/generate-protocol", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text.slice(0, 200) || "Server returned an invalid response");
      }
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setSections(data.sections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = (id: string, content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  };

  const handleRegenerate = async (id: string, refinePrompt?: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    setRegeneratingId(id);
    try {
      const context = sections
        .filter((s) => s.id !== id)
        .map((s) => `${s.title}: ${s.content.slice(0, 200)}`)
        .join("\n");
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          currentContent: section.content,
          context,
          refinePrompt,
        }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text.slice(0, 200) || "Server returned an invalid response");
      }
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, content: data.content } : s))
      );
    } catch (err) {
      console.error("Regeneration failed:", err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "protocol", sections }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Protocol - AI Draft Version 1.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">
            Protocol Builder
          </h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[300px_1fr_240px]">
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-4">
          <NotesInput
            value={notes}
            onChange={setNotes}
            placeholder="Paste notes or dictated description of the trial..."
          />
          <FileUploader
            label="Additional Files"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
            multiple
            files={additionalFiles}
            onFilesChange={setAdditionalFiles}
          />
          <InlinePromptEditor
            label="Protocol"
            prompt={protocolPrompt}
            onPromptChange={saveProtocolPrompt}
            versions={versions}
            onSaveVersion={saveVersion}
            onRestoreVersion={restoreVersion}
            onDeleteVersion={deleteVersion}
            accentColor="emerald"
          />
        </div>

        {/* CENTER PANEL */}
        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <p className="text-sm text-slate-500">
                  Generating protocol sections...
                </p>
              </div>
            </div>
          ) : (
            <SectionList
              sections={sections}
              onUpdate={handleUpdateSection}
              onRegenerate={handleRegenerate}
              onDelete={handleDelete}
              regeneratingId={regeneratingId}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div>
          <SectionOrderPanel sections={sections} onReorder={setSections} />
        </div>
      </div>

      <BottomBar>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || (!notes.trim() && additionalFiles.length === 0)}
          className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Protocol"}
        </button>
        {sections.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Create Protocol
          </button>
        )}
      </BottomBar>
    </div>
  );
}
