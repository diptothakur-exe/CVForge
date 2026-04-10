// app/api/ai/rewrite/route.ts
import { NextRequest } from "next/server"
import { rewriteSection } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, content, jd } = body

    if (!section || content === undefined) {
      return Response.json(
        { success: false, error: "Missing section or content" },
        { status: 400 }
      )
    }

    const updatedContent = await rewriteSection(section, content, jd)

    return Response.json({ success: true, updatedContent })
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
