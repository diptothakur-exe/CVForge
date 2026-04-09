// app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCVStore } from "@/lib/store/cvStore";
import { restoreBackup } from "@/lib/hooks/useAutosave";
import { parseFile } from "@/lib/api/parser";
import { CVData } from "@/lib/types/cv";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { FilePlus, Upload, Clock, ArrowRight, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { versions, createVersion, switchVersion, deleteVersion, loadCV, resetCV } =
    useCVStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  function handleNew() {
    resetCV();
    createVersion("Untitled CV");
    router.push("/editor");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const cv = await parseFile(file);
      loadCV(cv as CVData);
      createVersion(`Imported: ${file.name}`);
      toast.success("CV imported successfully");
      router.push("/editor");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  function handleRestoreBackup() {
    const backup = restoreBackup();
    if (!backup) {
      toast.error("No backup found");
      return;
    }
    loadCV(backup.cv as CVData);
    createVersion("Restored from backup");
    toast.success("Backup restored");
    router.push("/editor");
  }

  function handleOpenVersion(id: string) {
    switchVersion(id);
    router.push("/editor");
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">CV Builder</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Version-controlled · AI-powered · ATS-ready
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <button
          onClick={handleNew}
          className="flex items-center gap-3 border border-border rounded-lg p-4 hover:bg-secondary transition-colors text-left"
        >
          <FilePlus className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-sm">New CV</p>
            <p className="text-xs text-muted-foreground">Start from scratch</p>
          </div>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-3 border border-border rounded-lg p-4 hover:bg-secondary transition-colors text-left disabled:opacity-50"
        >
          <Upload className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-sm">
              {importing ? "Importing…" : "Import PDF / DOCX"}
            </p>
            <p className="text-xs text-muted-foreground">AI-structured parsing</p>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleImport}
        />

        <button
          onClick={handleRestoreBackup}
          className="flex items-center gap-3 border border-border rounded-lg p-4 hover:bg-secondary transition-colors text-left"
        >
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-sm">Restore Backup</p>
            <p className="text-xs text-muted-foreground">From local storage</p>
          </div>
        </button>
      </div>

      {/* Versions list */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Saved Versions ({versions.length})
        </h2>

        {versions.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 border border-dashed border-border rounded-lg text-center">
            No versions yet. Create or import a CV to get started.
          </p>
        )}

        <ul className="space-y-2">
          {[...versions].reverse().map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between border border-border rounded-lg px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{v.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(v.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenVersion(v.id)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Open <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteVersion(v.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
