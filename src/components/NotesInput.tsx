"use client";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function NotesInput({ value, onChange, placeholder }: NotesInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">
        Notes / Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Paste notes or dictated description of the trial..."}
        className="h-48 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}
