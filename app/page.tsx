// app/page.tsx
"use client"
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-forge-100 px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl tracking-tight">ForgeCV</span>
        <Link href="/editor" className="forge-btn-primary">
          Open Editor →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <p className="text-xs font-mono text-forge-400 tracking-widest uppercase mb-6">
          Version-Controlled · AI-Powered · ATS-Optimized
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-forge-900 leading-tight mb-6 max-w-3xl">
          Build CVs that<br />
          <em>actually get noticed</em>
        </h1>
        <p className="text-forge-500 text-lg max-w-xl mb-10 leading-relaxed">
          Inline editing with AI-powered section rewrites. Version control like Git.
          Skill matching against job descriptions. Export clean ATS-friendly PDFs.
        </p>
        <div className="flex gap-3">
          <Link href="/editor" className="forge-btn-primary text-base px-5 py-2.5">
            Start Building
          </Link>
          <Link href="/dashboard" className="forge-btn-outline text-base px-5 py-2.5">
            My CVs
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-16">
          {[
            "Version snapshots",
            "AI section rewrite",
            "Skill gap analysis",
            "PDF/DOCX import",
            "ATS-safe export",
            "Diff view",
            "Portfolio links",
            "Autosave"
          ].map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 border border-forge-200 rounded-full text-forge-600 font-mono"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-forge-100 px-8 py-4 text-center text-xs text-forge-400 font-mono">
        ForgeCV · MIT License
      </footer>
    </main>
  )
}
