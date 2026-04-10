// components/editor/SkillMatchPanel.tsx
"use client"
import { useState } from "react"
import { useCVStore } from "@/store/cvStore"
import type { SkillMatchResult } from "@/types/cv"
import toast from "react-hot-toast"

export default function SkillMatchPanel() {
  const { currentCV, setJobInput } = useCVStore()
  const [jd, setJd] = useState(currentCV?.jobInput ?? "")
  const [result, setResult] = useState<SkillMatchResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function runMatch() {
    if (!jd.trim()) { toast.error("Paste a job description first"); return }
    const skills = currentCV?.sections?.skills ?? []
    if (!skills.length) { toast.error("Add skills to your CV first"); return }

    setLoading(true)
    try {
      setJobInput(jd)
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, jd })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Match failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-card">
      <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-forge-400 mb-3">
        Skill Match · JD Analysis
      </h3>
      <textarea
        className="forge-input text-xs resize-none mb-2"
        rows={5}
        placeholder="Paste job description here…"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />
      <button
        onClick={runMatch}
        disabled={loading}
        className="forge-btn-primary w-full text-xs justify-center mb-3"
      >
        {loading ? "Analyzing…" : "✦ Analyze Skills"}
      </button>

      {result && (
        <div className="space-y-3 animate-fade-in">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-forge-100 rounded-full h-1.5">
              <div
                className="bg-forge-900 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${result.matchScore}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-forge-900 w-10 text-right">
              {result.matchScore}%
            </span>
          </div>

          {/* Matched */}
          {result.matched.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-success mb-1">✓ Matched ({result.matched.length})</p>
              <div className="flex flex-wrap gap-1">
                {result.matched.map((s, i) => (
                  <span key={i} className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing */}
          {result.missing.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-danger mb-1">✗ Missing ({result.missing.length})</p>
              <div className="flex flex-wrap gap-1">
                {result.missing.map((s, i) => (
                  <span key={i} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-warn mb-1">↑ Suggestions</p>
              <ul className="space-y-0.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-[11px] text-forge-600">· {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
