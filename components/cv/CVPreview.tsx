// components/cv/CVPreview.tsx
"use client";

import { CVData } from "@/lib/types/cv";

interface CVPreviewProps {
  cv: CVData;
}

export function CVPreview({ cv }: CVPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto px-8 py-10 font-sans text-sm text-foreground space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold">{cv.name || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
          {cv.email && <span>{cv.email}</span>}
          {cv.phone && <span>{cv.phone}</span>}
          {cv.location && <span>{cv.location}</span>}
          {cv.linkedin && <span>{cv.linkedin}</span>}
          {cv.github && <span>{cv.github}</span>}
          {cv.website && <span>{cv.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {cv.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed">{cv.summary}</p>
        </Section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {cv.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold">{exp.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{exp.company}</p>
                {exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-sm">
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
      {cv.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {cv.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <p className="font-semibold">{edu.degree} in {edu.field}</p>
                  <p className="text-xs text-muted-foreground">{edu.institution}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {edu.startDate} – {edu.endDate || "Present"}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <Section title="Skills">
          <p className="text-sm">{cv.skills.join(" · ")}</p>
        </Section>
      )}

      {/* Projects */}
      {cv.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {cv.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold">{proj.name}</p>
                  {proj.url && (
                    <a href={proj.url} className="text-xs text-primary underline" target="_blank" rel="noreferrer">
                      {proj.url}
                    </a>
                  )}
                </div>
                {proj.techStack.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-1">{proj.techStack.join(", ")}</p>
                )}
                <p className="text-sm">{proj.description}</p>
                {proj.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-sm mt-1">
                    {proj.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
