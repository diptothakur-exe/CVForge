# ForgeCV

Version-controlled CV builder with AI-powered section optimization.

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Zustand + TipTap
- **Backend**: Supabase (PostgreSQL) + Next.js API routes
- **AI**: OpenRouter (Gemini 2.0 Flash → Llama 3.3 70B → Mimo V2)

## Setup

### 1. Clone & install
```bash
git clone https://github.com/yourname/forgecv
cd forgecv
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```
Fill in:
- `OPENROUTER_API_KEY` — from openrouter.ai
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` — from your Supabase project
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same values

### 3. Supabase schema
Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run dev
```bash
npm run dev
```

## Deploy
Push to GitHub → connect to Vercel → add env vars in Vercel dashboard → deploy.

## Features
- **Version control** — full JSON snapshots, fork/switch/diff
- **Inline editing** — TipTap rich editor, autosave
- **AI rewrite** — per-section with OpenRouter multi-model routing
- **Import** — PDF, DOCX, TXT → AI-structured JSON
- **Diff view** — GitHub-style section comparison
- **Skill match** — JD vs CV gap analysis
- **PDF export** — ATS-safe HTML print

## AI Model Routing
| Task | Primary | Fallback |
|------|---------|---------|
| rewrite | gemini-2.0-flash-exp | llama-3.3-70b |
| parse | gemini-2.0-flash-exp | llama-3.3-70b |
| diff/structure | mimo-v2-flash | gemini-2.0-flash-exp |
| skill match | gemini-2.0-flash-exp | llama-3.3-70b |

## File Structure
```
/app
  /dashboard       — version list
  /editor          — split editor/preview
  /api
    /ai/rewrite    — POST section rewrite
    /ai/match      — POST skill gap analysis
    /parse/resume  — POST file → JSON
    /pdf/export    — POST CV → HTML (print-to-PDF)

/components
  /cv
    CVPreview.tsx  — ATS-clean render
    DiffView.tsx   — GitHub-style diff
  /editor
    Toolbar.tsx
    VersionPanel.tsx
    EditorPanel.tsx
    SectionEditor.tsx
    ExperienceEditor.tsx
    BasicsEditor.tsx
    SkillMatchPanel.tsx

/lib
  ai.ts            — OpenRouter multi-model routing
  supabase.ts      — DB client
  diff.ts          — Section-wise diff engine
  parser.ts        — File text extraction

/store
  cvStore.ts       — Zustand central state

/types
  cv.ts            — All TypeScript types
```
