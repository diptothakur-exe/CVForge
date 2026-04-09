// app/api/parse/route.ts
// Pipeline: upload → extract raw text → AI structure → return CVData JSON

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.name.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (file.name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Upload PDF or DOCX.");
}

const STRUCTURE_PROMPT = `
You are a CV parsing expert. Extract and structure the following raw CV text into this exact JSON shape (no markdown, no preamble):

{
  "id": "<generate a uuid-like string>",
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "website": "",
  "summary": "",
  "experience": [
    { "id": "<uuid>", "company": "", "role": "", "startDate": "", "endDate": "", "bullets": [] }
  ],
  "education": [
    { "id": "<uuid>", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }
  ],
  "skills": [],
  "projects": [
    { "id": "<uuid>", "name": "", "description": "", "url": "", "techStack": [], "bullets": [] }
  ],
  "createdAt": "<ISO string>",
  "updatedAt": "<ISO string>"
}

If a field is missing, use empty string or empty array. Never invent data.
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Step 1: Extract raw text
    let rawText: string;
    try {
      rawText = await extractText(file);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Text extraction failed" },
        { status: 422 }
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 422 });
    }

    // Step 2: AI structuring
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: STRUCTURE_PROMPT },
        { role: "user", content: rawText.slice(0, 8000) }, // cap tokens
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "{}";

    let parsed: unknown;
    try {
      // Strip possible markdown fences
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[/api/parse]", e);
    return NextResponse.json({ error: "Parsing failed" }, { status: 500 });
  }
}
