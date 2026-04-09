// components/editor/SectionEditor.tsx
"use client";

import { useCVStore } from "@/lib/store/cvStore";
import { CVExperience, CVEducation, CVProject } from "@/lib/types/cv";
import { InlineText } from "@/components/editor/InlineText";
import { BulletList } from "@/components/editor/BulletList";
import { AIRewriteButton } from "@/components/editor/AIRewriteButton";
import { rewriteSummary, rewriteBullets } from "@/lib/api/ai";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SectionEditor() {
  const { currentCV, updateSection } = useCVStore();
  const [jd, setJd] = useState("");

  // ── Helpers ──────────────────────────────────────────────
  function addExperience() {
    const newExp: CVExperience = {
      id: generateId(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      bullets: [],
    };
    updateSection("experience", [...currentCV.experience, newExp]);
  }

  function updateExp(id: string, field: keyof CVExperience, value: unknown) {
    updateSection(
      "experience",
      currentCV.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function removeExp(id: string) {
    updateSection("experience", currentCV.experience.filter((e) => e.id !== id));
  }

  function addEducation() {
    const newEdu: CVEducation = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    updateSection("education", [...currentCV.education, newEdu]);
  }

  function updateEdu(id: string, field: keyof CVEducation, value: string) {
    updateSection(
      "education",
      currentCV.education.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function removeEdu(id: string) {
    updateSection("education", currentCV.education.filter((e) => e.id !== id));
  }

  function addProject() {
    const newProj: CVProject = {
      id: generateId(),
      name: "",
      description: "",
      techStack: [],
      bullets: [],
    };
    updateSection("projects", [...currentCV.projects, newProj]);
  }

  function updateProj(id: string, field: keyof CVProject, value: unknown) {
    updateSection(
      "projects",
      currentCV.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function removeProj(id: string) {
    updateSection("projects", currentCV.projects.filter((p) => p.id !== id));
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

      {/* JD for AI context */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Job Description (optional, used by AI)
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={3}
          placeholder="Paste job description here for AI-powered matching and rewriting…"
          className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Contact */}
      <section>
        <SectionHeader title="Contact" />
        <div className="grid grid-cols-2 gap-3">
          {(["name","email","phone","location","linkedin","github","website"] as const).map((f) => (
            <InlineText
              key={f}
              label={f}
              value={currentCV[f] ?? ""}
              onChange={(v) => updateSection(f, v)}
            />
          ))}
        </div>
      </section>

      {/* Summary */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Summary" />
          <AIRewriteButton
            onRewrite={async () => {
              const result = await rewriteSummary(currentCV.summary, jd || undefined);
              updateSection("summary", result);
              toast.success("Summary rewritten");
            }}
          />
        </div>
        <textarea
          value={currentCV.summary}
          onChange={(e) => updateSection("summary", e.target.value)}
          rows={4}
          placeholder="Professional summary…"
          className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </section>

      {/* Experience */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Experience" />
          <button onClick={addExperience} className="add-btn">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-6">
          {currentCV.experience.map((exp) => (
            <div key={exp.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <InlineText label="Company" value={exp.company} onChange={(v) => updateExp(exp.id, "company", v)} />
                  <InlineText label="Role" value={exp.role} onChange={(v) => updateExp(exp.id, "role", v)} />
                  <InlineText label="Start Date" value={exp.startDate} onChange={(v) => updateExp(exp.id, "startDate", v)} />
                  <InlineText label="End Date" value={exp.endDate} onChange={(v) => updateExp(exp.id, "endDate", v)} />
                </div>
                <button onClick={() => removeExp(exp.id)} className="delete-btn ml-3">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Bullets</label>
                  <AIRewriteButton
                    onRewrite={async () => {
                      const result = await rewriteBullets(exp.bullets, jd || undefined);
                      updateExp(exp.id, "bullets", result);
                      toast.success("Bullets rewritten");
                    }}
                  />
                </div>
                <BulletList
                  bullets={exp.bullets}
                  onChange={(bullets) => updateExp(exp.id, "bullets", bullets)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Education" />
          <button onClick={addEducation} className="add-btn">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {currentCV.education.map((edu) => (
            <div key={edu.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <InlineText label="Institution" value={edu.institution} onChange={(v) => updateEdu(edu.id, "institution", v)} />
                  <InlineText label="Degree" value={edu.degree} onChange={(v) => updateEdu(edu.id, "degree", v)} />
                  <InlineText label="Field" value={edu.field} onChange={(v) => updateEdu(edu.id, "field", v)} />
                  <InlineText label="GPA" value={edu.gpa ?? ""} onChange={(v) => updateEdu(edu.id, "gpa", v)} />
                  <InlineText label="Start" value={edu.startDate} onChange={(v) => updateEdu(edu.id, "startDate", v)} />
                  <InlineText label="End" value={edu.endDate} onChange={(v) => updateEdu(edu.id, "endDate", v)} />
                </div>
                <button onClick={() => removeEdu(edu.id)} className="delete-btn ml-3">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <SectionHeader title="Skills" />
        <textarea
          value={currentCV.skills.join(", ")}
          onChange={(e) =>
            updateSection(
              "skills",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          rows={3}
          placeholder="React, TypeScript, Node.js, …"
          className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
      </section>

      {/* Projects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Projects" />
          <button onClick={addProject} className="add-btn">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {currentCV.projects.map((proj) => (
            <div key={proj.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <InlineText label="Name" value={proj.name} onChange={(v) => updateProj(proj.id, "name", v)} />
                  <InlineText label="URL" value={proj.url ?? ""} onChange={(v) => updateProj(proj.id, "url", v)} />
                  <div className="col-span-2">
                    <InlineText label="Description" value={proj.description} onChange={(v) => updateProj(proj.id, "description", v)} />
                  </div>
                  <div className="col-span-2">
                    <InlineText
                      label="Tech Stack (comma-separated)"
                      value={proj.techStack.join(", ")}
                      onChange={(v) =>
                        updateProj(proj.id, "techStack", v.split(",").map((s) => s.trim()).filter(Boolean))
                      }
                    />
                  </div>
                </div>
                <button onClick={() => removeProj(proj.id)} className="delete-btn ml-3">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Bullets</label>
                <BulletList
                  bullets={proj.bullets}
                  onChange={(bullets) => updateProj(proj.id, "bullets", bullets)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
      {title}
    </h2>
  );
}
