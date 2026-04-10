// app/api/parse/resume/route.ts
import { NextRequest } from "next/server"
import { parseResumeToJSON } from "@/lib/ai"
import { cleanText } from "@/lib/parser"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop()?.toLowerCase()
    let rawText = ""

    if (ext === "txt") {
      rawText = await file.text()
    } else if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      // Dynamic import for server-only modules
      const pdfParse = (await import("pdf-parse")).default
      const result = await pdfParse(buffer)
      rawText = result.text
    } else if (ext === "docx" || ext === "doc") {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const mammoth = await import("mammoth")
      const result = await mammoth.extractRawText({ buffer })
      rawText = result.value
    } else {
      return Response.json(
        { success: false, error: `Unsupported file type: .${ext}` },
        { status: 400 }
      )
    }

    rawText = cleanText(rawText)

    // Parse to structured JSON via AI
    const jsonRaw = await parseResumeToJSON(rawText)
    let structured
    try {
      structured = JSON.parse(jsonRaw.replace(/```json|```/g, "").trim())
    } catch {
      // AI output not parseable — return raw text for manual fallback
      return Response.json({ success: true, rawText, structured: null })
    }

    return Response.json({ success: true, rawText, structured })
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
