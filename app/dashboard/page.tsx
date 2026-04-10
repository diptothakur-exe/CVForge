// app/dashboard/page.tsx
"use client"
import { useCVStore } from "@/store/cvStore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function DashboardPage() {
  const { versions, createVersion, deleteVersion, switchVersion } = useCVStore()
  const router = useRouter()

  function handleNew() {
    createVersion("Untitled CV")
    router.push("/editor")
  }

  function handleOpen(id: string) {
    switchVersion(id)
    router.push("/editor")
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    deleteVersion(id)
    toast.success("Version deleted")
  }

  return (
    <main className="min-h-screen bg-forge-50">
      <nav className="bg-white border-b border-forge-100 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight text-forge-900">
          ForgeCV
        </Link>
        <button onClick={handleNew} className="forge-btn-primary">
          + New CV
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-forge-900">My CVs</h1>
            <p className="text-sm text-forge-500 mt-1">
              {versions.length} version{versions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/editor" className="forge-btn-outline">
            Open Editor
          </Link>
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-forge-200 rounded-xl">
            <p className="text-forge-400 text-sm mb-4">No CVs yet.</p>
            <button onClick={handleNew} className="forge-btn-primary">
              Create your first CV
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {[...versions].reverse().map((v) => (
              <div
                key={v.id}
                className="bg-white border border-forge-100 rounded-lg px-5 py-4 flex items-center justify-between hover:border-forge-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-forge-900 text-sm">{v.title}</p>
                  <p className="text-xs text-forge-400 font-mono mt-0.5">
                    Updated {new Date(v.updatedAt).toLocaleDateString()} ·{" "}
                    {v.sections.basics?.name || "No name"} ·{" "}
                    {v.sections.experience?.length ?? 0} roles
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpen(v.id)}
                    className="forge-btn-ghost text-xs"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.title)}
                    className="forge-btn-ghost text-xs text-danger hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
