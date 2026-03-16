import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <main className="flex flex-col items-center gap-12 px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Report & Protocol Builder
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            AI-assisted document generation for research trials
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/protocol"
            className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-10 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl transition-colors group-hover:bg-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Protocol Builder
              </h2>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Transform rough notes into structured trial protocols with AI-powered generation
              </p>
            </div>
          </Link>

          <Link
            href="/report"
            className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-10 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl transition-colors group-hover:bg-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Report Builder
              </h2>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Generate scientific reports from protocols, data, and images with AI interpretation
              </p>
            </div>
          </Link>
        </div>

        <Link
          href="/admin"
          className="text-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          Admin Settings
        </Link>
      </main>
    </div>
  );
}
