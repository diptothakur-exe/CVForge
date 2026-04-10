// components/editor/EditorPanel.tsx
"use client"
import { useState } from "react"
import BasicsEditor from "./BasicsEditor"
import SectionEditor from "./SectionEditor"
import ExperienceEditor from "./ExperienceEditor"
import SkillMatchPanel from "./SkillMatchPanel"
import { useCVStore } from "@/store/cvStore"

const TABS = ["Basics", "Experience", "Skills", "JD Match"] as const
type Tab = (typeof TABS)[number]

export default function EditorPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("Basics")
  const { currentCV } = useCVStore()
  const jd = currentCV?.jobInput

  if (!currentCV) {
    return (
      <div className="flex-1 flex items-center justify-center text-forge-400 text-sm">
        No CV loaded. Create or import one.
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="flex border-b border-forge-100 px-4 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors mr-1 -mb-px ${
              activeTab === tab
                ? "border-forge-900 text-forge-900"
                : "border-transparent text-forge-400 hover:text-forge-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "Basics" && (
          <>
            <BasicsEditor />
            <SectionEditor
              sectionKey="summary"
              label="Professional Summary"
              placeholder="Write a compelling professional summary…"
              jd={jd}
            />
            <SectionEditor
              sectionKey="certifications"
              label="Certifications"
            />
            <SectionEditor
              sectionKey="languages"
              label="Languages"
            />
          </>
        )}

        {activeTab === "Experience" && (
          <>
            <ExperienceEditor jd={jd} />
            <EducationSection />
            <ProjectsSection jd={jd} />
          </>
        )}

        {activeTab === "Skills" && (
          <SectionEditor
            sectionKey="skills"
            label="Technical Skills"
            placeholder="Add a skill and press Enter"
            jd={jd}
          />
        )}

        {activeTab === "JD Match" && <SkillMatchPanel />}
      </div>
    </div>
  )
}

// ─── Education (inline) ─────────────────────────────────────────────────────

function EducationSection() {
  const { currentCV, updateSection } = useCVStore()
  const education = currentCV?.sections?.education ?? []

  function addEdu() {
    const { generateId } = require("@/lib/parser")
    updateSection("education", [
      ...education,
      { id: generateId(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }
    ])
  }

  function updateEdu(id: string, patch: Record<string, string>) {
    updateSection("education", education.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeEdu(id: string) {
    updateSection("education", education.filter((e) => e.id !== id))
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-forge-400">
          Education
        </h3>
        <button onClick={addEdu} className="forge-btn-ghost text-xs py-0.5 px-2">+ Add</button>
      </div>
      <div className="space-y-3">
        {education.map((edu) => (
          <div key={edu.id} className="border border-forge-100 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "institution", label: "Institution", span: true, placeholder: "MIT" },
                { key: "degree", label: "Degree", span: false, placeholder: "B.Sc." },
                { key: "field", label: "Field", span: false, placeholder: "Computer Science" },
                { key: "startDate", label: "Start", span: false, placeholder: "Sep 2018" },
                { key: "endDate", label: "End", span: false, placeholder: "Jun 2022" },
                { key: "gpa", label: "GPA", span: false, placeholder: "3.9" }
              ].map(({ key, label, span, placeholder }) => (
                <div key={key} className={span ? "col-span-2" : ""}>
                  <label className="block text-[10px] text-forge-400 mb-0.5 font-mono">{label}</label>
                  <input
                    className="forge-input text-xs"
                    placeholder={placeholder}
                    value={(edu as Record<string, string>)[key] ?? ""}
                    onChange={(e) => updateEdu(edu.id, { [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => removeEdu(edu.id)}
              className="text-[10px] text-forge-300 hover:text-danger mt-2"
            >
              Remove
            </button>
          </div>
        ))}
        {!education.length && (
          <p className="text-xs text-forge-400 text-center py-3">No education entries.</p>
        )}
      </div>
    </div>
  )
}

// ─── Projects (inline) ──────────────────────────────────────────────────────

function ProjectsSection({ jd }: { jd?: string }) {
  const { currentCV, updateSection } = useCVStore()
  const projects = currentCV?.sections?.projects ?? []
  const [bulletInputs, setBulletInputs] = useState<Record<string, string>>({})

  function addProject() {
    const { generateId } = require("@/lib/parser")
    updateSection("projects", [
      ...projects,
      { id: generateId(), name: "", description: "", tech: [], url: "", bullets: [] }
    ])
  }

  function updateProject(id: string, patch: Partial<(typeof projects)[0]>) {
    updateSection("projects", projects.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function removeProject(id: string) {
    updateSection("projects", projects.filter((p) => p.id !== id))
  }

  function addBullet(id: string) {
    const t = (bulletInputs[id] ?? "").trim()
    if (!t) return
    const proj = projects.find((p) => p.id === id)
    if (!proj) return
    updateProject(id, { bullets: [...proj.bullets, t] })
    setBulletInputs((prev) => ({ ...prev, [id]: "" }))
  }

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-forge-400">Projects</h3>
        <button onClick={addProject} className="forge-btn-ghost text-xs py-0.5 px-2">+ Add</button>
      </div>
      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="border border-forge-100 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input className="forge-input text-xs col-span-2" placeholder="Project name" value={p.name}
                onChange={(e) => updateProject(p.id, { name: e.target.value })} />
              <input className="forge-input text-xs" placeholder="URL (optional)" value={p.url}
                onChange={(e) => updateProject(p.id, { url: e.target.value })} />
              <input className="forge-input text-xs" placeholder="Tech (comma-sep.)" value={p.tech.join(", ")}
                onChange={(e) => updateProject(p.id, { tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <textarea className="forge-input text-xs col-span-2 resize-none" rows={2} placeholder="Brief description"
                value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} />
            </div>
            <div className="space-y-1 mb-1.5">
              {p.bullets.map((b, i) => (
                <div key={i} className="flex gap-1.5 items-center text-xs text-forge-700">
                  <span className="text-forge-300">·</span>
                  <span className="flex-1">{b}</span>
                  <button onClick={() => updateProject(p.id, { bullets: p.bullets.filter((_, j) => j !== i) })}
                    className="text-forge-300 hover:text-danger">×</button>
                </div>
              ))}
            </div>
            <input className="forge-input text-xs" placeholder="Add bullet, press Enter"
              value={bulletInputs[p.id] ?? ""}
              onChange={(e) => setBulletInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addBullet(p.id)} />
            <button onClick={() => removeProject(p.id)}
              className="text-[10px] text-forge-300 hover:text-danger mt-2">Remove</button>
          </div>
        ))}
        {!projects.length && <p className="text-xs text-forge-400 text-center py-3">No projects yet.</p>}
      </div>
    </div>
  )
}
