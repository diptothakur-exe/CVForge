// app/api/ai/match/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SkillMatchResult } from "@/lib/types/cv";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { cvSkills, jd } = (await req.json()) as {
      cvSkills: string[];
      jd: string;
    };

    if (!cvSkills || !jd) {
      return NextResponse.json({ error: "Missing cvSkills or jd" }, { status: 400 });
    }

    const prompt = `
You are a recruitment expert. Given the job description and the candidate's skills, return a JSON object only (no markdown, no preamble) with this exact shape:
{
  "matchScore": <0-100 integer>,
  "matchedSkills": [...],
  "missingSkills": [...],
  "suggestions": [<3 short actionable suggestions>]
}

Job Description:
${jd}

Candidate Skills:
${cvSkills.join(", ")}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw) as SkillMatchResult;

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[/api/ai/match]", e);
    return NextResponse.json({ error: "Skill match failed" }, { status: 500 });
  }
}
