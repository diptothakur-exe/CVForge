// components/editor/ExperienceEditor.tsx
"use client"
import { useState } from "react"
import { useCVStore } from "@/store/cvStore"
import { generateId } from "@/lib/parser"
import type { CVExperienceItem } from "@/types/cv"
import toast from "react-hot-toast"

interface Props { jd?: string }

export default function ExperienceEditor({ jd }: Props) {
  const { currentCV, updateSection } = useCVStore()
  const experience = currentCV?.sections?.experience ?? []

  function addExperience() {
    const blank: CVExperienceItem = {
      id: generateId(),
      company: "",
      role: "",
      startDate: "",
      endDate: "Present",
      bullets: []
    }
    updateSection("experience", [...experience, blank])
  }

  function updateItem(id: string, patch: Partial<CVExperienceItem>) {
    updateSection(
      "experience",
      experience.map((e) => (e.id === id ? { ...e, ...patch } : e))
    )
  }

  function removeItem(id: string) {
    updateSection("experience", experience.filter((e) => e.id !== id))
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-forge-400">
          Experience
        </h3>
        <button onClick={addExperience} className="forge-btn-ghost text-xs py-0.5 px-2">
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {experience.map((exp) => (
          <ExperienceItem
            key={exp.id}
            item={exp}
            jd={jd}
            onUpdate={(patch) => updateItem(exp.id, patch)}
            onRemove={() => removeItem(exp.id)}
          />
        ))}
      </div>

      {experience.length === 0 && (
        <p className="text-xs text-forge-400 text-center py-4">
          No experience entries yet.
        </p>
      )}
    </div>
  )
}

function ExperienceItem({
  item,
  jd,
  onUpdate,
  onRemove
}: {
  item: CVExperienceItem
  jd?: string
  onUpdate: (p: Partial<CVExperienceItem>) => void
  onRemove: () => void
}) {
  const [bulletInput, setBulletInput] = useState("")
  const [rewriting, setRewriting] = useState(false)

  function addBullet() {
    const t = bulletInput.trim()
    if (!t) return
    onUpdate({ bullets: [...item.bullets, t] })
    setBulletInput("")
  }

  function removeBullet(i: number) {
    onUpdate({ bullets: item.bullets.filter((_, idx) => idx !== i) })
  }

  async function rewriteBullets() {
    if (!item.bullets.length) {
      toast.error("No bullets to rewrite")
      return
    }
    setRewriting(true)
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: `experience.${item.company}`,
          content: item.bullets.join("\n"),
          jd
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      const newBullets = data.updatedContent
        .split("\n")
        .map((b: string) => b.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
      onUpdate({ bullets: newBullets })
      toast.success("Bullets rewritten")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rewrite failed")
    } finally {
      setRewriting(false)
    }
  }

  return (
    <div className="border border-forge-100 rounded-lg p-3 group">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          className="forge-input text-xs"
          placeholder="Company"
          value={item.company}
          onChange={(e) => onUpdate({ company: e.target.value })}
        />
        <input
          className="forge-input text-xs"
          placeholder="Role / Title"
          value={item.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
        />
        <input
          className="forge-input text-xs"
          placeholder="Start date (e.g. Jan 2022)"
          value={item.startDate}
          onChange={(e) => onUpdate({ startDate: e.target.value })}
        />
        <input
          className="forge-input text-xs"
          placeholder="End date"
          value={item.endDate}
          onChange={(e) => onUpdate({ endDate: e.target.value })}
        />
      </div>

      {/* Bullets */}
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-forge-400 font-mono">Bullets</p>
        <button
          onClick={rewriteBullets}
          disabled={rewriting}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-forge-500 hover:text-forge-900"
        >
          {rewriting ? "…" : "✦ AI"}
        </button>
      </div>
      <div className="space-y-1 mb-2">
        {item.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-1.5 group/bullet">
            <span className="text-forge-300 mt-1 text-xs shrink-0">·</span>
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const newBullets = [...item.bullets]
                newBullets[i] = e.currentTarget.textContent ?? ""
                onUpdate({ bullets: newBullets })
              }}
              className="flex-1 text-xs text-forge-700 outline-none focus:bg-forge-50 rounded px-1 min-h-[18px]"
            >
              {b}
            </p>
            <button
              onClick={() => removeBullet(i)}
              className="opacity-0 group-hover/bullet:opacity-100 text-forge-300 hover:text-danger text-xs shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        className="forge-input text-xs"
        placeholder="Add bullet, press Enter"
        value={bulletInput}
        onChange={(e) => setBulletInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addBullet()}
      />

      <div className="flex justify-end mt-2">
        <button
          onClick={onRemove}
          className="text-[10px] text-forge-300 hover:text-danger transition-colors"
        >
          Remove entry
        </button>
      </div>
    </div>
  )
}
