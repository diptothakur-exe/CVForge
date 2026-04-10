// lib/parser.ts

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "txt") {
    return await file.text()
  }

  if (ext === "pdf") {
    return await extractPDF(file)
  }

  if (ext === "docx" || ext === "doc") {
    return await extractDOCX(file)
  }

  throw new Error(`Unsupported file type: .${ext}`)
}

async function extractPDF(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/parse/resume", {
    method: "POST",
    body: formData
  })

  if (!res.ok) throw new Error("PDF parse failed")
  const data = await res.json()
  return data.rawText ?? ""
}

async function extractDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  // Use mammoth via API route for server-side processing
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/parse/resume", {
    method: "POST",
    body: formData
  })

  if (!res.ok) throw new Error("DOCX parse failed")
  const data = await res.json()
  return data.rawText ?? ""
}

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim()
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
