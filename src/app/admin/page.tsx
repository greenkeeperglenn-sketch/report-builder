"use client";

import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import AdminPromptEditor from "@/components/AdminPromptEditor";

export default function AdminPage() {
  return (
    <PasswordGate>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center gap-4">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              &larr; Back
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">
              Admin Settings
            </h1>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <AdminPromptEditor />
        </div>
      </div>
    </PasswordGate>
  );
}
