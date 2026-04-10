// app/api/pdf/export/route.ts
import { NextRequest } from "next/server"
import type { CVSections } from "@/types/cv"

function renderHTML(sections: CVSections): string {
  const { basics, summary, experience, education, skills, projects } = sections
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 32px 40px; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  h2 { font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 2px; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .sub { font-size: 10px; color: #555; margin-bottom: 10px; }
  .item { margin-bottom: 8px; }
  .item-header { display: flex; justify-content: space-between; font-weight: bold; }
  .item-sub { color: #555; font-size: 10px; }
  ul { margin: 3px 0 0 14px; padding: 0; }
  li { margin-bottom: 2px; }
  .skills { display: flex; flex-wrap: wrap; gap: 4px; }
  .skill { background: #f4f4f5; border-radius: 2px; padding: 2px 6px; font-size: 10px; }
</style>
</head>
<body>
  <h1>${basics.name || "Name"}</h1>
  <div class="sub">
    ${[basics.title, basics.email, basics.phone, basics.location].filter(Boolean).join(" · ")}
    ${basics.linkedin ? `· ${basics.linkedin}` : ""}
    ${basics.github ? `· ${basics.github}` : ""}
  </div>
  ${summary ? `<h2>Summary</h2><p>${summary}</p>` : ""}
  ${experience.length ? `
    <h2>Experience</h2>
    ${experience.map((e) => `
      <div class="item">
        <div class="item-header"><span>${e.company}</span><span>${e.startDate} – ${e.endDate}</span></div>
        <div class="item-sub">${e.role}</div>
        <ul>${e.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      </div>
    `).join("")}
  ` : ""}
  ${education.length ? `
    <h2>Education</h2>
    ${education.map((e) => `
      <div class="item">
        <div class="item-header"><span>${e.institution}</span><span>${e.startDate} – ${e.endDate}</span></div>
        <div class="item-sub">${e.degree} in ${e.field}${e.gpa ? ` · GPA: ${e.gpa}` : ""}</div>
      </div>
    `).join("")}
  ` : ""}
  ${skills.length ? `
    <h2>Skills</h2>
    <div class="skills">${skills.map((s) => `<span class="skill">${s}</span>`).join("")}</div>
  ` : ""}
  ${projects.length ? `
    <h2>Projects</h2>
    ${projects.map((p) => `
      <div class="item">
        <div class="item-header"><span>${p.name}</span>${p.url ? `<span>${p.url}</span>` : ""}</div>
        <div class="item-sub">${p.tech.join(", ")}</div>
        <ul>${p.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      </div>
    `).join("")}
  ` : ""}
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sections } = body as { sections: CVSections }

    if (!sections) {
      return Response.json(
        { success: false, error: "Missing sections" },
        { status: 400 }
      )
    }

    const html = renderHTML(sections)

    // Return HTML for client-side print-to-PDF fallback
    // For server-side PDF, integrate Puppeteer in a separate service
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "X-PDF-Note": "Use browser print to save as PDF"
      }
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error"
      },
      { status: 500 }
    )
  }
}
