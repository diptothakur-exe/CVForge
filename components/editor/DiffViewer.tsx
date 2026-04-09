// components/editor/DiffViewer.tsx
"use client";

import { useMemo, useState } from "react";
import { useCVStore } from "@/lib/store/cvStore";
import { computeDiff } from "@/lib/api/diff";

export function DiffViewer() {
  const { versions, currentCV } = useCVStore();
  const [compareId, setCompareId] = useState<string>(versions[0]?.id ?? "");

  const compareVersion = versions.find((v) => v.id === compareId);

  const diff = useMemo(() => {
    if (!compareVersion) return null;
    return computeDiff(compareVersion.snapshot, currentCV);
  }, [compareVersion, currentCV]);

  if (versions.length === 0) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        No versions to compare. Save at least one version first.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-1">Compare with version</label>
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            className="text-sm border border-border rounded px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring w-full"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} — {new Date(v.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!diff && (
        <p className="text-sm text-muted-foreground">Select a version to compare.</p>
      )}

      {diff && Object.keys(diff).length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No differences found.</p>
      )}

      {diff && Object.keys(diff).length > 0 && (
        <div className="space-y-6">
          {Object.entries(diff).map(([section, sectionDiff]) => (
            <div key={section} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary px-4 py-2 border-b border-border">
                <p className="text-sm font-semibold capitalize">{section}</p>
              </div>
              <div className="p-4 space-y-2 text-sm font-mono">
                <DiffSection diff={sectionDiff as never} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30" /> Added
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30" /> Removed
        </span>
      </div>
    </div>
  );
}

function DiffSection({ diff }: { diff: { added?: string[]; removed?: string[]; modified?: boolean } | Record<string, unknown> }) {
  // Handle nested (experience, projects)
  if (diff && !("added" in diff) && !("removed" in diff)) {
    return (
      <div className="space-y-3">
        {Object.entries(diff).map(([id, d]) => (
          <div key={id}>
            <p className="text-xs text-muted-foreground mb-1">ID: {id}</p>
            <DiffSection diff={d as never} />
          </div>
        ))}
      </div>
    );
  }

  const { added = [], removed = [] } = diff as { added?: string[]; removed?: string[] };

  return (
    <div className="space-y-1">
      {removed.map((line, i) => (
        <div key={`r-${i}`} className="bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-0.5 rounded">
          − {line}
        </div>
      ))}
      {added.map((line, i) => (
        <div key={`a-${i}`} className="bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
          + {line}
        </div>
      ))}
    </div>
  );
}
