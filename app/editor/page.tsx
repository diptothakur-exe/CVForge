// app/editor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useCVStore } from "@/lib/store/cvStore";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { CVPreview } from "@/components/cv/CVPreview";
import { VersionSidebar } from "@/components/editor/VersionSidebar";
import { SectionEditor } from "@/components/editor/SectionEditor";
import { DiffViewer } from "@/components/editor/DiffViewer";
import { SkillMatcher } from "@/components/editor/SkillMatcher";
import { useRouter } from "next/navigation";
import { LayoutPanelLeft, GitBranch, Target, Eye, Download } from "lucide-react";
import { toast } from "sonner";

type Tab = "edit" | "diff" | "match" | "preview";

export default function EditorPage() {
  const { currentCV, versions, activeVersionId } = useCVStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("edit");
  const [exporting, setExporting] = useState(false);

  // Redirect if no CV loaded
  useEffect(() => {
    if (!currentCV.name && !currentCV.email && versions.length === 0) {
      router.replace("/dashboard");
    }
  }, []);

  // Autosave
  useAutosave();

  async function handleExportPDF() {
    setExporting(true);
    try {
      const { renderCVtoHTML } = await import("@/components/cv/renderCVtoHTML");
      const html = renderCVtoHTML(currentCV);
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentCV.name || "cv"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "edit", label: "Edit", icon: <LayoutPanelLeft className="w-4 h-4" /> },
    { id: "diff", label: "Diff", icon: <GitBranch className="w-4 h-4" /> },
    { id: "match", label: "Match JD", icon: <Target className="w-4 h-4" /> },
    { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar - versions */}
      <VersionSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              {activeVersionId
                ? versions.find((v) => v.id === activeVersionId)?.label
                : "unsaved"}
            </span>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          </div>
        </header>

        {/* Panel */}
        <div className="flex-1 overflow-auto">
          {tab === "edit" && <SectionEditor />}
          {tab === "diff" && <DiffViewer />}
          {tab === "match" && <SkillMatcher />}
          {tab === "preview" && <CVPreview cv={currentCV} />}
        </div>
      </div>
    </div>
  );
}
