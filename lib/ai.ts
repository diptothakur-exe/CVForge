// lib/ai.ts

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"

type TaskType = "rewrite" | "parse" | "diff" | "match" | "bullet"

const MODEL_ROUTING: Record<TaskType, string[]> = {
  rewrite: [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free"
  ],
  parse: [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free"
  ],
  diff: [
    "mimo-community/mimo-v2-flash:free",
    "google/gemini-2.0-flash-exp:free"
  ],
  match: [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free"
  ],
  bullet: [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free"
  ]
}

interface AICallOptions {
  task: TaskType
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
}

interface AIResponse {
  content: string
  model: string
}

async function callModel(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set")

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://forgecv.vercel.app",
      "X-Title": "ForgeCV"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Model ${model} failed: ${err}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error(`Empty response from ${model}`)
  return content
}

export async function callAI(opts: AICallOptions): Promise<AIResponse> {
  const { task, systemPrompt, userPrompt, maxTokens = 1500 } = opts
  const models = MODEL_ROUTING[task]

  for (const model of models) {
    try {
      const content = await callModel(model, systemPrompt, userPrompt, maxTokens)
      return { content, model }
    } catch (err) {
      console.warn(`[AI] ${model} failed, trying next:`, err)
      continue
    }
  }

  throw new Error(`All models failed for task: ${task}`)
}

export async function rewriteSection(
  section: string,
  content: string,
  jd?: string
): Promise<string> {
  const system = `You are an expert CV writer. Rewrite the given CV section to be concise, impactful, and ATS-optimized.
${jd ? `Target job description context:\n${jd}` : ""}
Return ONLY the rewritten content, no explanations.`

  const user = `Section: ${section}\nContent:\n${typeof content === "string" ? content : JSON.stringify(content)}`

  const res = await callAI({ task: "rewrite", systemPrompt: system, userPrompt: user })
  return res.content
}

export async function parseResumeToJSON(rawText: string): Promise<string> {
  const system = `You are a CV parser. Extract structured data from the resume text and return ONLY valid JSON.
Schema:
{
  "basics": { "name":"","email":"","phone":"","location":"","title":"","linkedin":"","github":"","website":"" },
  "summary": "",
  "experience": [{ "id":"","company":"","role":"","startDate":"","endDate":"","bullets":[] }],
  "education": [{ "id":"","institution":"","degree":"","field":"","startDate":"","endDate":"","gpa":"" }],
  "skills": [],
  "projects": [{ "id":"","name":"","description":"","tech":[],"url":"","bullets":[] }],
  "certifications": [],
  "languages": []
}
Return ONLY the JSON object. No markdown, no explanation.`

  const res = await callAI({
    task: "parse",
    systemPrompt: system,
    userPrompt: rawText,
    maxTokens: 2000
  })
  return res.content
}

export async function matchSkills(
  cvSkills: string[],
  jd: string
): Promise<string> {
  const system = `You are a skill matching expert. Compare CV skills to a job description.
Return ONLY valid JSON:
{ "matched": [], "missing": [], "matchScore": 0-100, "suggestions": [] }
No markdown, no explanation.`

  const user = `CV Skills: ${cvSkills.join(", ")}\n\nJob Description:\n${jd}`

  const res = await callAI({ task: "match", systemPrompt: system, userPrompt: user })
  return res.content
}

export async function generateBulletFromProject(
  projectName: string,
  description: string,
  tech: string[]
): Promise<string> {
  const system = `You are an expert CV bullet point writer. Generate 1 concise, action-verb-led bullet point from a project description. Return ONLY the bullet text.`
  const user = `Project: ${projectName}\nDescription: ${description}\nTech: ${tech.join(", ")}`

  const res = await callAI({ task: "bullet", systemPrompt: system, userPrompt: user })
  return res.content.trim()
}
