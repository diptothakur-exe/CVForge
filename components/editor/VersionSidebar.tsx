// components/editor/VersionSidebar.tsx
"use client";

import { useCVStore } from "@/lib/store/cvStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Home, CheckCircle2 } from "lucide-react";

export function VersionSidebar() {
  const { versions, activeVersionId, createVersion, switchVersion, currentCV } =
    useCVStore();
  const router = useRouter();

  function handleSaveAsVersion() {
    const label = `v${versions.length + 1} — ${new Date().toLocaleDateString()}`;
    createVersion(label);
    toast.success(`Saved as "${label}"`);
  }

  return (
    <aside className="w-56 border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Logo / home */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      {/* CV name */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Current CV
        </p>
        <p className="text-sm font-medium truncate">{currentCV.name || "Untitled"}</p>
      </div>

      {/* Versions */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 flex items-center justify-between sticky top-0 bg-background border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Versions
          </p>
          <button
            onClick={handleSaveAsVersion}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Save current as new version"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {versions.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground">No versions saved yet.</p>
        )}

        <ul className="py-1">
          {[...versions].reverse().map((v) => (
            <li key={v.id}>
              <button
                onClick={() => switchVersion(v.id)}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-2 hover:bg-secondary transition-colors ${
                  v.id === activeVersionId ? "bg-secondary" : ""
                }`}
              >
                {v.id === activeVersionId ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 mt-0.5 rounded-full border border-border shrink-0" />
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-medium truncate">{v.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
