// app/editor/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useCVStore } from "@/store/cvStore"
import { useAutosave } from "@/hooks/useAutosave"
import Toolbar from "@/components/editor/Toolbar"
import VersionPanel from "@/components/editor/VersionPanel"
import EditorPanel from "@/components/editor/EditorPanel"
import CVPreview from "@/components/cv/CVPreview"

type PanelMode = "edit" | "preview" | "split"

export default function EditorPage() {
  const { currentCV, createVersion } = useCVStore()
  const [mode, setMode] = useState<PanelMode>("split")
  useAutosave()

  // Initialize with blank CV if none exists
  useEffect(() => {
    if (!currentCV) {
      createVersion("My CV")
    }
  }, []) // eslint-disable-line

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Toolbar />

      <div className="flex flex-1 min-h-0">
        {/* Version sidebar */}
        <VersionPanel />

        {/* Mode switcher + main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mode bar */}
          <div className="border-b border-forge-100 px-4 py-1.5 flex items-center gap-1">
            {(["split", "edit", "preview"] as PanelMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded transition-colors ${
                  mode === m
                    ? "bg-forge-900 text-white"
                    : "text-forge-400 hover:text-forge-700"
                }`}
              >
                {m}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-forge-400 font-mono">
              {currentCV?.sections?.basics?.name || "Unnamed"} ·{" "}
              {currentCV?.sections?.experience?.length ?? 0} roles ·{" "}
              {currentCV?.sections?.skills?.length ?? 0} skills
            </span>
          </div>

          {/* Content area */}
          <div className="flex-1 flex min-h-0">
            {/* Editor pane */}
            {(mode === "edit" || mode === "split") && (
              <div
                className={`flex flex-col overflow-hidden border-r border-forge-100 ${
                  mode === "split" ? "w-1/2" : "w-full"
                }`}
              >
                <EditorPanel />
              </div>
            )}

            {/* Preview pane */}
            {(mode === "preview" || mode === "split") && (
              <div
                className={`overflow-y-auto bg-forge-50 ${
                  mode === "split" ? "w-1/2" : "w-full"
                }`}
              >
                <div className="max-w-[700px] mx-auto my-4 shadow-sm border border-forge-100">
                  {currentCV ? (
                    <CVPreview sections={currentCV.sections} />
                  ) : (
                    <div className="p-8 text-center text-forge-400 text-sm">
                      No CV to preview
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
