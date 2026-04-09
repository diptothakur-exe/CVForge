// lib/api/ai.ts
// All AI calls go through this module. Section-level only.

import { AIRewriteInput, AIRewriteOutput, SkillMatchResult } from "@/lib/types/cv";

async function callRewriteAPI(payload: AIRewriteInput): Promise<AIRewriteOutput> {
  const res = await fetch("/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "AI rewrite failed");
  }

  return res.json() as Promise<AIRewriteOutput>;
}

export async function rewriteSummary(
  content: string,
  jd?: string
): Promise<string> {
  const result = await callRewriteAPI({ section: "summary", content, jd });
  return result.updatedContent as string;
}

export async function rewriteBullets(
  bullets: string[],
  jd?: string
): Promise<string[]> {
  const result = await callRewriteAPI({
    section: "experience",
    content: bullets.join("\n"),
    jd,
  });
  const raw = result.updatedContent as string;
  return raw
    .split("\n")
    .map((b) => b.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

export async function matchSkills(
  cvSkills: string[],
  jd: string
): Promise<SkillMatchResult> {
  const res = await fetch("/api/ai/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvSkills, jd }),
  });
  if (!res.ok) throw new Error("Skill match failed");
  return res.json() as Promise<SkillMatchResult>;
}

export async function generateBulletFromProject(
  projectDescription: string
): Promise<string> {
  const result = await callRewriteAPI({
    section: "projects",
    content: projectDescription,
  });
  return result.updatedContent as string;
}
