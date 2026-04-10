// components/editor/BasicsEditor.tsx
"use client"
import { useCVStore } from "@/store/cvStore"
import type { CVBasics } from "@/types/cv"

export default function BasicsEditor() {
  const { currentCV, updateSection } = useCVStore()
  const basics = currentCV?.sections?.basics

  if (!basics) return null

  function update(field: keyof CVBasics, value: string) {
    updateSection("basics", { ...basics!, [field]: value })
  }

  const fields: { key: keyof CVBasics; label: string; placeholder: string }[] = [
    { key: "name", label: "Full Name", placeholder: "Jane Doe" },
    { key: "title", label: "Professional Title", placeholder: "Senior Software Engineer" },
    { key: "email", label: "Email", placeholder: "jane@example.com" },
    { key: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
    { key: "location", label: "Location", placeholder: "New York, NY" },
    { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/janedoe" },
    { key: "github", label: "GitHub", placeholder: "github.com/janedoe" },
    { key: "website", label: "Website", placeholder: "janedoe.dev" }
  ]

  return (
    <div className="section-card">
      <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-forge-400 mb-3">
        Contact & Basics
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className={key === "name" || key === "title" ? "col-span-2" : ""}>
            <label className="block text-[10px] text-forge-400 mb-0.5 font-mono">{label}</label>
            <input
              className="forge-input text-xs"
              placeholder={placeholder}
              value={basics[key] ?? ""}
              onChange={(e) => update(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
