// components/editor/VersionPanel.tsx
"use client"
import { useState } from "react"
import { useCVStore } from "@/store/cvStore"
import DiffView from "@/components/cv/DiffView"
import toast from "react-hot-toast"

export default function VersionPanel() {
  const {
    versions,
    currentCV,
    activeVersionId,
    switchVersion,
    createVersion,
    deleteVersion,
    saveVersion
  } = useCVStore()

  const [diffTarget, setDiffTarget] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  function handleSave() {
    saveVersion()
    toast.success("Version saved")
  }

  function handleFork() {
    if (!currentCV) return
    createVersion(`${currentCV.title} (fork)`, currentCV.sections)
    toast.success("Forked to new version")
  }

  function handleDelete(id: string) {
    if (versions.length <= 1) {
      toast.error("Cannot delete the only version")
      return
    }
    deleteVersion(id)
    toast.success("Deleted")
  }

  const diffVersionA = versions.find((v) => v.id === activeVersionId)
  const diffVersionB = versions.find((v) => v.id === diffTarget)

  return (
    <aside className="w-64 border-r border-forge-100 bg-forge-50 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-forge-100 flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-forge-500 uppercase tracking-widest">
          Versions
        </span>
        <div className="flex gap-1">
          <button onClick={handleSave} className="forge-btn-ghost text-xs py-1 px-2">
            Save
          </button>
          <button onClick={handleFork} className="forge-btn-ghost text-xs py-1 px-2">
            Fork
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {[...versions].reverse().map((v) => (
          <div
            key={v.id}
            className={`rounded-md px-3 py-2 cursor-pointer transition-colors group ${
              v.id === activeVersionId
                ? "bg-forge-900 text-white"
                : "bg-white border border-forge-100 hover:border-forge-300"
            }`}
          >
            <div
              className="flex items-center justify-between"
              onClick={() => switchVersion(v.id)}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    v.id === activeVersionId ? "text-white" : "text-forge-900"
                  }`}
                >
                  {v.title}
                </p>
                <p
                  className={`text-[10px] font-mono mt-0.5 ${
                    v.id === activeVersionId ? "text-forge-300" : "text-forge-400"
                  }`}
                >
                  {new Date(v.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Sub-actions */}
            <div className={`flex gap-1 mt-1.5 ${v.id === activeVersionId ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDiffTarget(v.id)
                  setShowDiff(true)
                }}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  v.id === activeVersionId
                    ? "bg-forge-700 text-forge-200 hover:bg-forge-600"
                    : "bg-forge-100 text-forge-600 hover:bg-forge-200"
                }`}
              >
                Diff
              </button>
              {v.id !== activeVersionId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(v.id)
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 hover:bg-red-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Diff Modal */}
      {showDiff && diffVersionA && diffVersionB && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-forge-100">
              <div>
                <h3 className="font-semibold text-sm">Diff View</h3>
                <p className="text-xs text-forge-400 font-mono">
                  {diffVersionA.title} vs {diffVersionB.title}
                </p>
              </div>
              <button
                onClick={() => setShowDiff(false)}
                className="forge-btn-ghost text-xs"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <DiffView versionA={diffVersionA} versionB={diffVersionB} />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
