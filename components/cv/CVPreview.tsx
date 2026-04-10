// components/cv/CVPreview.tsx
"use client"
import type { CVSections } from "@/types/cv"

interface Props { sections: CVSections }

export default function CVPreview({ sections }: Props) {
  const { basics, summary, experience, education, skills, projects, certifications, languages } = sections

  return (
    <div className="bg-white font-sans text-[11px] leading-relaxed text-forge-900 p-8 min-h-full">
      {/* Header */}
      <div className="mb-5 border-b border-forge-200 pb-4">
        <h1 className="text-[22px] font-semibold tracking-tight leading-none mb-1">
          {basics.name || <span className="text-forge-300">Your Name</span>}
        </h1>
        {basics.title && (
          <p className="text-forge-600 text-[12px] mb-2">{basics.title}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-forge-500 text-[10px] font-mono">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.linkedin && <span>{basics.linkedin}</span>}
          {basics.github && <span>{basics.github}</span>}
          {basics.website && <span>{basics.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Summary">
          <p className="text-forge-700 leading-relaxed">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-forge-900">{exp.company}</span>
                  <span className="text-forge-400 font-mono text-[10px]">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <p className="text-forge-600 italic mb-1">{exp.role}</p>
                {exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-forge-700">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{edu.institution}</span>
                  <span className="text-forge-400 font-mono text-[10px]">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <p className="text-forge-600">
                  {edu.degree} in {edu.field}
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1">
            {skills.map((s, i) => (
              <span
                key={i}
                className="bg-forge-100 text-forge-700 px-2 py-0.5 rounded text-[10px] font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{p.name}</span>
                  {p.url && (
                    <span className="text-forge-400 font-mono text-[10px]">{p.url}</span>
                  )}
                </div>
                {p.tech.length > 0 && (
                  <p className="text-forge-500 text-[10px] font-mono mb-1">
                    {p.tech.join(" · ")}
                  </p>
                )}
                {p.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-forge-700">
                    {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="space-y-0.5 text-forge-700">
            {certifications.map((c, i) => <li key={i}>· {c}</li>)}
          </ul>
        </Section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <Section title="Languages">
          <p className="text-forge-700">{languages.join(", ")}</p>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[9px] font-mono font-semibold uppercase tracking-[0.12em] text-forge-400 border-b border-forge-100 pb-1 mb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}
