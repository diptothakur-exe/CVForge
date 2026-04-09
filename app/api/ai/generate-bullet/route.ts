// app/api/ai/generate-bullet/route.ts
// Converts a project description into a single strong CV bullet point

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description, techStack } = (await req.json()) as {
      description: string;
      techStack?: string[];
    };

    if (!description) {
      return NextResponse.json({ error: "Missing description" }, { status: 400 });
    }

    const tech = techStack?.length ? `Tech stack: ${techStack.join(", ")}` : "";

    const prompt = `Convert the following project description into a single, strong CV bullet point. 
Start with a strong action verb. Quantify impact if possible. Be concise (max 2 lines).
Return ONLY the bullet text. No dash, no preamble.

${tech}
Project: ${description}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 120,
    });

    const bullet = response.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ bullet });
  } catch (e) {
    console.error("[/api/ai/generate-bullet]", e);
    return NextResponse.json({ error: "Bullet generation failed" }, { status: 500 });
  }
}
