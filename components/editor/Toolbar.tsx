// components/editor/Toolbar.tsx
"use client"
import { useState, useRef } from "react"
import { useCVStore } from "@/store/cvStore"
import Link from "next/link"
import toast from "react-hot-toast"

export default function Toolbar() {
  const { currentCV, isDirty, saveVersion, setVersionTitle, loadFromJSON } = useCVStore()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  function startEditTitle() {
    setTitleVal(currentCV?.title ?? "")
    setEditingTitle(true)
  }

  function commitTitle() {
    if (titleVal.trim()) setVersionTitle(titleVal.trim())
    setEditingTitle(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/parse/resume", { method: "POST", body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      if (data.structured) {
        loadFromJSON(data.structured, file.name.replace(/\.[^.]+$/, ""))
        toast.success("CV imported and structured!")
      } else {
        toast.error("AI parse failed — please fill manually.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleExport() {
    if (!currentCV) return
    setExporting(true)
    try {
      const res = await fetch("/api/pdf/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: currentCV.sections })
      })
      if (!res.ok) throw new Error("Export failed")
      const html = await res.text()
      const win = window.open("", "_blank")
      if (!win) throw new Error("Popup blocked — allow popups and retry")
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 500)
      toast.success("Print dialog opened — save as PDF")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="h-12 border-b border-forge-100 bg-white flex items-center px-4 gap-3 shrink-0">
      {/* Logo */}
      <Link href="/" className="font-display text-base text-forge-900 mr-2 shrink-0">
        ForgeCV
      </Link>

      <div className="w-px h-5 bg-forge-200" />

      {/* Title */}
      {editingTitle ? (
        <input
          autoFocus
          value={titleVal}
          onChange={(e) => setTitleVal(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => e.key === "Enter" && commitTitle()}
          className="text-sm font-medium border-b border-forge-900 outline-none px-1 bg-transparent w-48"
        />
      ) : (
        <button
          onClick={startEditTitle}
          className="text-sm font-medium text-forge-900 hover:text-forge-600 transition-colors truncate max-w-xs"
        >
          {currentCV?.title ?? "No CV loaded"}
        </button>
      )}

      {isDirty && (
        <span className="text-[10px] text-forge-400 font-mono">● unsaved</span>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
        onChange={handleImport}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        className="forge-btn-outline text-xs"
      >
        {importing ? "Importing…" : "Import CV"}
      </button>

      <button
        onClick={() => { saveVersion(); toast.success("Saved") }}
        disabled={!isDirty}
        className="forge-btn-ghost text-xs"
      >
        Save
      </button>

      <button
        onClick={handleExport}
        disabled={!currentCV || exporting}
        className="forge-btn-primary text-xs"
      >
        {exporting ? "Exporting…" : "Export PDF"}
      </button>

      <Link href="/dashboard" className="forge-btn-ghost text-xs">
        Dashboard
      </Link>
    </header>
  )
}
