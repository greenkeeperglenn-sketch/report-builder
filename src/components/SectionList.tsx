"use client";

import { Section } from "@/lib/types";
import SectionEditor from "./SectionEditor";

interface SectionListProps {
  sections: Section[];
  onUpdate: (id: string, content: string) => void;
  onRegenerate: (id: string) => void;
  onDelete: (id: string) => void;
  regeneratingId?: string | null;
}

export default function SectionList({
  sections,
  onUpdate,
  onRegenerate,
  onDelete,
  regeneratingId,
}: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12">
        <p className="text-center text-sm text-slate-400">
          Generated sections will appear here.<br />
          Enter your notes and click Generate to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onUpdate={onUpdate}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
          isRegenerating={regeneratingId === section.id}
        />
      ))}
    </div>
  );
}
