// components/cv/DiffView.tsx
"use client"
import { useMemo } from "react"
import { computeDiff, hasDiff } from "@/lib/diff"
import type { CVVersion } from "@/types/cv"

interface Props {
  versionA: CVVersion
  versionB: CVVersion
}

export default function DiffView({ versionA, versionB }: Props) {
  const diff = useMemo(
    () => computeDiff(versionA.sections, versionB.sections),
    [versionA, versionB]
  )

  if (!hasDiff(diff)) {
    return (
      <div className="text-center py-16 text-forge-400 text-sm font-mono">
        No differences found between versions.
      </div>
    )
  }

  return (
    <div className="space-y-4 font-mono text-xs p-4">
      <div className="flex gap-4 text-xs mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-200 inline-block" />
          Added
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" />
          Removed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-200 inline-block" />
          Modified
        </span>
      </div>

      {Object.entries(diff).map(([section, sectionDiff]) => (
        <div key={section} className="border border-forge-200 rounded-lg overflow-hidden">
          {/* Section header */}
          <div className="bg-forge-50 px-4 py-2 border-b border-forge-200 flex items-center gap-2">
            <span className="text-forge-600 font-semibold uppercase tracking-widest text-[10px]">
              {section}
            </span>
            {sectionDiff.modified && (
              <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                modified
              </span>
            )}
          </div>

          <div className="p-4 space-y-1">
            {/* Word-level diff (summary / string fields) */}
            {sectionDiff.changes && (
              <p className="leading-relaxed">
                {sectionDiff.changes.map((c, i) => {
                  if (c.type === "add")
                    return (
                      <mark key={i} className="bg-green-100 text-green-800 rounded px-0.5 mx-0.5 no-underline">
                        {c.value}
                      </mark>
                    )
                  if (c.type === "remove")
                    return (
                      <mark key={i} className="bg-red-100 text-red-700 line-through rounded px-0.5 mx-0.5">
                        {c.value}
                      </mark>
                    )
                  return <span key={i}>{c.value}</span>
                })}
              </p>
            )}

            {/* Array diff (bullets / skills) */}
            {sectionDiff.added?.map((item, i) => (
              <div
                key={`add-${i}`}
                className="flex items-start gap-2 bg-green-50 border border-green-100 rounded px-3 py-1.5"
              >
                <span className="text-green-600 font-bold mt-0.5">+</span>
                <span className="text-green-800">{item}</span>
              </div>
            ))}
            {sectionDiff.removed?.map((item, i) => (
              <div
                key={`rem-${i}`}
                className="flex items-start gap-2 bg-red-50 border border-red-100 rounded px-3 py-1.5"
              >
                <span className="text-red-600 font-bold mt-0.5">−</span>
                <span className="text-red-700 line-through">{item}</span>
              </div>
            ))}

            {/* Nested diffs (experience / projects) */}
            {!sectionDiff.changes &&
              !sectionDiff.added &&
              !sectionDiff.removed &&
              typeof sectionDiff === "object" &&
              Object.entries(sectionDiff)
                .filter(([k]) => k !== "modified")
                .map(([id, subDiff]) => {
                  if (typeof subDiff !== "object" || subDiff === null) return null
                  const sd = subDiff as { added?: string[]; removed?: string[] }
                  return (
                    <div key={id} className="pl-2 border-l-2 border-forge-200 space-y-1 mt-1">
                      <p className="text-forge-400 text-[10px] mb-1">id: {id}</p>
                      {sd.added?.map((b, i) => (
                        <div key={i} className="flex gap-2 bg-green-50 rounded px-2 py-1 text-green-800">
                          <span className="font-bold">+</span> {b}
                        </div>
                      ))}
                      {sd.removed?.map((b, i) => (
                        <div key={i} className="flex gap-2 bg-red-50 rounded px-2 py-1 text-red-700 line-through">
                          <span className="font-bold">−</span> {b}
                        </div>
                      ))}
                    </div>
                  )
                })}
          </div>
        </div>
      ))}
    </div>
  )
}
