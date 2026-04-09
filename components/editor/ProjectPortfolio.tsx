// components/editor/ProjectPortfolio.tsx
// Links portfolio projects to experience entries and generates bullets from project descriptions

"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store/cvStore";
import { toast } from "sonner";
import { Loader2, Sparkles, Link2, Unlink, ChevronDown, ChevronRight } from "lucide-react";

export function ProjectPortfolio() {
  const { currentCV, attachProjectToExperience, detachProjectFromExperience, appendBulletToExperience } =
    useCVStore();

  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null); // projectId

  async function handleGenerateBullet(
    expId: string,
    projectId: string,
    description: string,
    techStack: string[]
  ) {
    setGeneratingFor(projectId);
    try {
      const res = await fetch("/api/ai/generate-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, techStack }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const { bullet } = (await res.json()) as { bullet: string };
      appendBulletToExperience(expId, bullet);
      // Also attach project reference if not already linked
      attachProjectToExperience(expId, projectId);
      toast.success("Bullet added to experience");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate bullet");
    } finally {
      setGeneratingFor(null);
    }
  }

  if (currentCV.experience.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg text-center">
        Add experience entries first to link projects.
      </div>
    );
  }

  if (currentCV.projects.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg text-center">
        Add projects in the Edit tab to link them to experience.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currentCV.experience.map((exp) => {
        const isExpanded = expandedExp === exp.id;
        const linkedProjectIds = exp.projectIds ?? [];

        return (
          <div key={exp.id} className="border border-border rounded-lg overflow-hidden">
            {/* Experience header */}
            <button
              onClick={() => setExpandedExp(isExpanded ? null : exp.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium">{exp.role || "Untitled Role"}</p>
                <p className="text-xs text-muted-foreground">{exp.company}</p>
              </div>
              <div className="flex items-center gap-2">
                {linkedProjectIds.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {linkedProjectIds.length} linked
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Projects panel */}
            {isExpanded && (
              <div className="border-t border-border divide-y divide-border">
                {currentCV.projects.map((proj) => {
                  const isLinked = linkedProjectIds.includes(proj.id);
                  const isGenerating = generatingFor === proj.id;

                  return (
                    <div
                      key={proj.id}
                      className="px-4 py-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{proj.name || "Unnamed Project"}</p>
                        {proj.techStack.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {proj.techStack.join(", ")}
                          </p>
                        )}
                        {proj.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {proj.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Link / Unlink */}
                        <button
                          onClick={() =>
                            isLinked
                              ? detachProjectFromExperience(exp.id, proj.id)
                              : attachProjectToExperience(exp.id, proj.id)
                          }
                          title={isLinked ? "Unlink project" : "Link project"}
                          className={`p-1.5 rounded-md transition-colors ${
                            isLinked
                              ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive"
                              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isLinked ? (
                            <Unlink className="w-3.5 h-3.5" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Generate bullet */}
                        <button
                          onClick={() =>
                            handleGenerateBullet(
                              exp.id,
                              proj.id,
                              proj.description,
                              proj.techStack
                            )
                          }
                          disabled={isGenerating || !proj.description}
                          title="Generate bullet from project"
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-border hover:bg-secondary transition-colors disabled:opacity-40"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                          )}
                          {isGenerating ? "Generating…" : "→ Bullet"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
