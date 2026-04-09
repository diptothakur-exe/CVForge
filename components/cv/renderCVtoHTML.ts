// components/cv/renderCVtoHTML.ts
// Generates ATS-friendly HTML string for Puppeteer PDF export

import { CVData } from "@/lib/types/cv";

export function renderCVtoHTML(cv: CVData): string {
  const skills = cv.skills.join(" · ");

  const experience = cv.experience
    .map(
      (exp) => `
      <div class="section-item">
        <div class="row">
          <strong>${exp.role}</strong>
          <span class="date">${exp.startDate} – ${exp.endDate || "Present"}</span>
        </div>
        <div class="subtitle">${exp.company}</div>
        <ul>
          ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");

  const education = cv.education
    .map(
      (edu) => `
      <div class="section-item">
        <div class="row">
          <strong>${edu.degree} in ${edu.field}</strong>
          <span class="date">${edu.startDate} – ${edu.endDate || "Present"}</span>
        </div>
        <div class="subtitle">${edu.institution}${edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</div>
      </div>`
    )
    .join("");

  const projects = cv.projects
    .map(
      (proj) => `
      <div class="section-item">
        <div class="row">
          <strong>${proj.name}</strong>
          ${proj.url ? `<a href="${proj.url}">${proj.url}</a>` : ""}
        </div>
        ${proj.techStack.length ? `<div class="subtitle">${proj.techStack.join(", ")}</div>` : ""}
        <p>${proj.description}</p>
        <ul>
          ${proj.bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      color: #000;
      padding: 0;
    }
    h1 { font-size: 18pt; font-weight: bold; }
    h2 {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin: 14px 0 6px;
    }
    .contact {
      font-size: 9pt;
      color: #444;
      margin-top: 2px;
    }
    .section-item {
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .date { font-size: 9pt; color: #555; }
    .subtitle { font-size: 9.5pt; color: #444; margin-top: 1px; }
    p { font-size: 10.5pt; margin-top: 2px; }
    ul { padding-left: 16px; margin-top: 3px; }
    li { font-size: 10.5pt; margin-bottom: 1px; }
    a { color: #000; }
  </style>
</head>
<body>
  <h1>${cv.name}</h1>
  <div class="contact">
    ${[cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.website].filter(Boolean).join(" | ")}
  </div>

  ${cv.summary ? `<h2>Summary</h2><p>${cv.summary}</p>` : ""}
  ${cv.experience.length ? `<h2>Experience</h2>${experience}` : ""}
  ${cv.education.length ? `<h2>Education</h2>${education}` : ""}
  ${skills ? `<h2>Skills</h2><p>${skills}</p>` : ""}
  ${cv.projects.length ? `<h2>Projects</h2>${projects}` : ""}
</body>
</html>`;
}
