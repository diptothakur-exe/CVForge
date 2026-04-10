// components/editor/SectionEditor.tsx
"use client"
import { useState, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useCVStore } from "@/store/cvStore"
import type { SectionKey, CVSections } from "@/types/cv"
import toast from "react-hot-toast"

interface SectionEditorProps {
  sectionKey: SectionKey
  label: string
  placeholder?: string
  jd?: string
}

export default function SectionEditor({
  sectionKey,
  label,
  placeholder = "Click to edit…",
  jd
}: SectionEditorProps) {
  const { currentCV, updateSection } = useCVStore()
  const [rewriting, setRewriting] = useState(false)

  const rawValue = currentCV?.sections?.[sectionKey]
  const isString = typeof rawValue === "string"

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder })
    ],
    content: isString ? rawValue : "",
    editable: isString,
    onUpdate: ({ editor }) => {
      if (isString) {
        updateSection(sectionKey, editor.getText() as CVSections[typeof sectionKey])
      }
    }
  })

  const handleAIRewrite = useCallback(async () => {
    if (!currentCV) return
    const content = isString
      ? (currentCV.sections[sectionKey] as string)
      : JSON.stringify(currentCV.sections[sectionKey])

    if (!content.trim()) {
      toast.error("Section is empty — nothing to rewrite")
      return
    }

    setRewriting(true)
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, content, jd })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      if (isString && editor) {
        editor.commands.setContent(data.updatedContent)
        updateSection(sectionKey, data.updatedContent as CVSections[typeof sectionKey])
      }
      toast.success(`${label} rewritten`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI rewrite failed")
    } finally {
      setRewriting(false)
    }
  }, [currentCV, editor, isString, jd, label, sectionKey, updateSection])

  if (!currentCV) return null

  return (
    <div className="section-card group">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-forge-400">
          {label}
        </h3>
        {isString && (
          <button
            onClick={handleAIRewrite}
            disabled={rewriting}
            className="opacity-0 group-hover:opacity-100 transition-opacity forge-btn-ghost text-[10px] py-0.5 px-2 text-forge-500"
          >
            {rewriting ? "Rewriting…" : "✦ AI Rewrite"}
          </button>
        )}
      </div>

      {isString ? (
        <div className="tiptap-editor min-h-[60px] text-sm text-forge-800 cursor-text">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <ArraySectionEditor
          sectionKey={sectionKey}
          value={rawValue as string[]}
          jd={jd}
        />
      )}
    </div>
  )
}

// Array fields (skills, certifications, languages)
function ArraySectionEditor({
  sectionKey,
  value,
  jd: _jd
}: {
  sectionKey: SectionKey
  value: string[]
  jd?: string
}) {
  const { updateSection } = useCVStore()
  const [input, setInput] = useState("")

  const items = Array.isArray(value) ? value : []

  function addItem() {
    const trimmed = input.trim()
    if (!trimmed || items.includes(trimmed)) return
    updateSection(sectionKey, [...items, trimmed] as CVSections[typeof sectionKey])
    setInput("")
  }

  function removeItem(idx: number) {
    updateSection(
      sectionKey,
      items.filter((_, i) => i !== idx) as CVSections[typeof sectionKey]
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-forge-100 text-forge-700 text-xs px-2 py-0.5 rounded font-mono"
          >
            {item}
            <button
              onClick={() => removeItem(i)}
              className="text-forge-400 hover:text-danger ml-0.5 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="forge-input text-xs"
        placeholder="Add item, press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addItem()}
      />
    </div>
  )
}
