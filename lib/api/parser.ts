// lib/api/parser.ts
// Handles file upload → raw text extraction → AI structuring pipeline

import { CVData } from "@/lib/types/cv";

export async function parseFile(file: File): Promise<CVData> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/parse", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "File parsing failed");
  }

  return res.json() as Promise<CVData>;
}
