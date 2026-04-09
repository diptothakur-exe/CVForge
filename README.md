# CV Builder 

Version-controlled CV builder with AI-powered section optimization and portfolio integration.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (state)
- **TipTap** (available for rich text if needed)
- **Supabase** (DB + auth — future)
- **OpenAI** (AI rewrites + parsing)
- **Puppeteer** (PDF export)
- **pdf-parse** + **mammoth** (import)
- **diff** (version compare)

## Setup

```bash
cp .env.example .env.local
# fill in your keys

npm install
npm run dev
```

## Env vars

| Key | Purpose |
|-----|---------|
| `OPENAI_API_KEY` | AI rewrites, parsing, skill match |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase (future auth/DB) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (future) |

## File Structure

```
/app
  /dashboard         → version list, import, start new
  /editor            → main editing interface
  /api/ai/rewrite    → section AI rewrite
  /api/ai/match      → JD skill matching
  /api/parse         → PDF/DOCX import pipeline
  /api/export/pdf    → Puppeteer PDF export

/components
  /cv
    CVPreview.tsx        → read-only ATS preview
    renderCVtoHTML.ts    → HTML string for PDF export
  /editor
    VersionSidebar.tsx   → version list + switcher
    SectionEditor.tsx    → main inline edit UI
    DiffViewer.tsx       → GitHub-style diff
    SkillMatcher.tsx     → JD vs CV skill analysis
    InlineText.tsx       → reusable field component
    BulletList.tsx       → editable bullet points
    AIRewriteButton.tsx  → isolated AI trigger

/lib
  /store
    cvStore.ts           → Zustand store (central brain)
  /types
    cv.ts                → all TypeScript types
  /api
    ai.ts                → AI client functions
    parser.ts            → file upload client
    diff.ts              → diff computation logic
  /hooks
    useAutosave.ts       → debounced autosave
```

## Features
- ✅ Inline editing (all sections)
- ✅ Version control (snapshot-based, immutable)
- ✅ Autosave to localStorage + version save
- ✅ AI rewrite (summary, bullets)
- ✅ PDF/DOCX import → AI structured JSON
- ✅ GitHub-style diff viewer
- ✅ JD skill matching with score
- ✅ PDF export (Puppeteer, ATS-friendly)
- ✅ Portfolio/projects section

## Commands (per spec)

| Command | Effect |
|---------|--------|
| `REFINE` | Improve code quality, same logic |
| `DEBUG` | Find + fix bugs with explanation |
| `EXTEND` | Add feature without breaking existing |
| `OPTIMIZE` | Performance / complexity reduction |
| `STRICT MODE` | Type safety + edge case audit |
| `DIFF CHECK` | Validate version compare logic |
| `PDF FIX` | Improve PDF layout |
| `REFACTOR SAFE` | Clean code, same behavior |
