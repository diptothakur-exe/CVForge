// app/api/ai/rewrite/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AIRewriteInput } from "@/lib/types/cv";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // For OpenRouter: baseURL: process.env.OPENROUTER_BASE_URL, apiKey: process.env.OPENROUTER_API_KEY
});

const SYSTEM_PROMPTS: Record<string, string> = {
  summary: `You are an expert CV writer. Rewrite the given professional summary to be concise, impactful, and ATS-optimized. Return ONLY the rewritten summary text. No preamble, no quotes.`,
  experience: `You are an expert CV writer. Rewrite the given bullet points to use strong action verbs, quantify results where possible, and be ATS-friendly. Return ONLY bullet points, one per line, starting with a dash (-). No preamble.`,
  projects: `You are an expert CV writer. Convert the given project description into a single strong CV bullet point starting with an action verb. Return ONLY the bullet. No preamble.`,
  skills: `You are an expert CV writer. Given these skills, return an optimized comma-separated list. No preamble.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIRewriteInput;
    const { section, content, jd } = body;

    if (!section || !content) {
      return NextResponse.json({ error: "Missing section or content" }, { status: 400 });
    }

    const systemPrompt =
      SYSTEM_PROMPTS[section] ?? SYSTEM_PROMPTS.experience;

    const userMessage = jd
      ? `Job Description:\n${jd}\n\nCV Content:\n${Array.isArray(content) ? content.join("\n") : content}`
      : Array.isArray(content)
      ? content.join("\n")
      : content;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const updatedContent = response.choices[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ updatedContent });
  } catch (e) {
    console.error("[/api/ai/rewrite]", e);
    return NextResponse.json({ error: "AI rewrite failed" }, { status: 500 });
  }
}
