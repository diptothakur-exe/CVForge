// components/editor/SkillMatcher.tsx
"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store/cvStore";
import { matchSkills } from "@/lib/api/ai";
import { SkillMatchResult } from "@/lib/types/cv";
import { toast } from "sonner";
import { Loader2, Target } from "lucide-react";

export function SkillMatcher() {
  const { currentCV } = useCVStore();
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<SkillMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMatch() {
    if (!jd.trim()) {
      toast.error("Paste a job description first");
      return;
    }
    if (currentCV.skills.length === 0) {
      toast.error("Add skills to your CV first");
      return;
    }
    setLoading(true);
    try {
      const res = await matchSkills(currentCV.skills, jd);
      setResult(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Match failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
          Job Description
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={6}
          placeholder="Paste the full job description here…"
          className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <button
        onClick={handleMatch}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
        {loading ? "Matching…" : "Analyze Match"}
      </button>

      {result && (
        <div className="space-y-5">
          {/* Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Match Score</span>
              <span className="text-sm font-bold">{result.matchScore}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${result.matchScore}%` }}
              />
            </div>
          </div>

          {/* Matched */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Matched Skills ({result.matchedSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Missing */}
          {result.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Missing Skills ({result.missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Suggestions
              </p>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
