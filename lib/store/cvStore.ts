// lib/store/cvStore.ts

import { create } from "zustand";
import { CVData, CVVersion, SectionKey } from "@/lib/types/cv";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeEmptyCV(): CVData {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    createdAt: now,
    updatedAt: now,
  };
}

interface CVStore {
  // State
  currentCV: CVData;
  versions: CVVersion[];
  activeVersionId: string | null;
  isDirty: boolean;

  // Version actions
  createVersion: (label?: string) => CVVersion;
  switchVersion: (versionId: string) => void;
  saveVersion: () => void;
  deleteVersion: (versionId: string) => void;

  // Section actions
  updateSection: <K extends SectionKey>(key: K, value: CVData[K]) => void;
  resetCV: () => void;
  loadCV: (cv: CVData) => void;

  // Portfolio integration
  attachProjectToExperience: (expId: string, projectId: string) => void;
  detachProjectFromExperience: (expId: string, projectId: string) => void;
  appendBulletToExperience: (expId: string, bullet: string) => void;
}

export const useCVStore = create<CVStore>((set, get) => ({
  currentCV: makeEmptyCV(),
  versions: [],
  activeVersionId: null,
  isDirty: false,

  createVersion: (label?: string) => {
    const { currentCV, versions } = get();
    const snapshot = structuredClone(currentCV);
    const version: CVVersion = {
      id: generateId(),
      label: label ?? `Version ${versions.length + 1}`,
      snapshot,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({
      versions: [...s.versions, version],
      activeVersionId: version.id,
      isDirty: false,
    }));

    console.debug("[cvStore] createVersion", version.id);
    return version;
  },

  switchVersion: (versionId: string) => {
    const { versions } = get();
    const target = versions.find((v) => v.id === versionId);
    if (!target) {
      console.warn("[cvStore] switchVersion: version not found", versionId);
      return;
    }
    // Clone snapshot to avoid mutating stored version
    set({
      currentCV: structuredClone(target.snapshot),
      activeVersionId: versionId,
      isDirty: false,
    });
    console.debug("[cvStore] switchVersion →", versionId);
  },

  saveVersion: () => {
    const { currentCV, activeVersionId, versions } = get();
    if (!activeVersionId) {
      console.warn("[cvStore] saveVersion: no active version, creating new one");
      get().createVersion();
      return;
    }

    const updated = versions.map((v) =>
      v.id === activeVersionId
        ? { ...v, snapshot: structuredClone(currentCV) }
        : v
    );

    set({ versions: updated, isDirty: false });
    console.debug("[cvStore] saveVersion", activeVersionId);
  },

  deleteVersion: (versionId: string) => {
    const { versions, activeVersionId } = get();
    const filtered = versions.filter((v) => v.id !== versionId);
    const newActive =
      activeVersionId === versionId
        ? filtered[filtered.length - 1]?.id ?? null
        : activeVersionId;

    set({ versions: filtered, activeVersionId: newActive });
  },

  updateSection: (key, value) => {
    set((s) => ({
      currentCV: {
        ...s.currentCV,
        [key]: value,
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  resetCV: () => {
    set({ currentCV: makeEmptyCV(), activeVersionId: null, isDirty: false });
  },

  loadCV: (cv: CVData) => {
    set({ currentCV: structuredClone(cv), isDirty: false });
  },

  attachProjectToExperience: (expId: string, projectId: string) => {
    set((s) => ({
      currentCV: {
        ...s.currentCV,
        experience: s.currentCV.experience.map((exp) => {
          if (exp.id !== expId) return exp;
          const already = exp.projectIds?.includes(projectId);
          if (already) return exp;
          return { ...exp, projectIds: [...(exp.projectIds ?? []), projectId] };
        }),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    }));
    console.debug("[cvStore] attachProjectToExperience", expId, projectId);
  },

  detachProjectFromExperience: (expId: string, projectId: string) => {
    set((s) => ({
      currentCV: {
        ...s.currentCV,
        experience: s.currentCV.experience.map((exp) =>
          exp.id !== expId
            ? exp
            : { ...exp, projectIds: (exp.projectIds ?? []).filter((id) => id !== projectId) }
        ),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  appendBulletToExperience: (expId: string, bullet: string) => {
    set((s) => ({
      currentCV: {
        ...s.currentCV,
        experience: s.currentCV.experience.map((exp) =>
          exp.id !== expId ? exp : { ...exp, bullets: [...exp.bullets, bullet] }
        ),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    }));
    console.debug("[cvStore] appendBulletToExperience", expId);
  },
}));
