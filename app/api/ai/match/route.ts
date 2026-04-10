// app/api/ai/match/route.ts
import { NextRequest } from "next/server"
import { matchSkills } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { skills, jd } = body

    if (!skills || !jd) {
      return Response.json(
        { success: false, error: "Missing skills or jd" },
        { status: 400 }
      )
    }

    const raw = await matchSkills(skills, jd)

    let parsed
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
    } catch {
      return Response.json(
        { success: false, error: "Failed to parse AI response" },
        { status: 500 }
      )
    }

    return Response.json({ success: true, ...parsed })
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
