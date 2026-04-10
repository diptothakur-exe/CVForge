// store/cvStore.ts
import { create } from "zustand"
import type { CVVersion, CVSections, SectionKey } from "@/types/cv"
import { generateId } from "@/lib/parser"

function deepClone<T>(val: T): T {
  return structuredClone(val)
}

const DEFAULT_SECTIONS: CVSections = {
  basics: {
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    linkedin: "",
    github: "",
    website: ""
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: []
}

interface CVStore {
  currentCV: CVVersion | null
  versions: CVVersion[]
  activeVersionId: string | null
  isDirty: boolean

  // Version ops
  createVersion: (title?: string, base?: CVSections) => CVVersion
  switchVersion: (versionId: string) => void
  restoreVersion: (versionId: string) => void
  saveVersion: () => void
  deleteVersion: (versionId: string) => void

  // Section ops
  updateSection: <K extends SectionKey>(key: K, value: CVSections[K]) => void

  // Meta
  setJobInput: (jd: string) => void
  setVersionTitle: (title: string) => void
  loadFromJSON: (sections: CVSections, title?: string) => void
  reset: () => void
}

export const useCVStore = create<CVStore>((set, get) => ({
  currentCV: null,
  versions: [],
  activeVersionId: null,
  isDirty: false,

  createVersion: (title = "Untitled CV", base?: CVSections) => {
    const now = new Date().toISOString()
    const newVersion: CVVersion = {
      id: generateId(),
      title,
      jobInput: "",
      sections: deepClone(base ?? DEFAULT_SECTIONS),
      createdAt: now,
      updatedAt: now
    }
    set((state) => ({
      versions: [...state.versions, newVersion],
      currentCV: deepClone(newVersion),
      activeVersionId: newVersion.id,
      isDirty: false
    }))
    return newVersion
  },

  switchVersion: (versionId: string) => {
    const { versions } = get()
    const found = versions.find((v) => v.id === versionId)
    if (!found) return
    set({
      currentCV: deepClone(found),
      activeVersionId: versionId,
      isDirty: false
    })
  },

  restoreVersion: (versionId: string) => {
    const { versions } = get()
    const found = versions.find((v) => v.id === versionId)
    if (!found) return
    const restored = deepClone(found)
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === versionId ? restored : v
      ),
      currentCV: deepClone(restored),
      activeVersionId: versionId,
      isDirty: false
    }))
  },

  saveVersion: () => {
    const { currentCV, versions } = get()
    if (!currentCV) return
    const updated: CVVersion = {
      ...deepClone(currentCV),
      updatedAt: new Date().toISOString()
    }
    const exists = versions.some((v) => v.id === updated.id)
    set({
      versions: exists
        ? versions.map((v) => (v.id === updated.id ? updated : v))
        : [...versions, updated],
      currentCV: deepClone(updated),
      isDirty: false
    })
  },

  deleteVersion: (versionId: string) => {
    set((state) => {
      const filtered = state.versions.filter((v) => v.id !== versionId)
      const isActive = state.activeVersionId === versionId
      return {
        versions: filtered,
        currentCV: isActive ? (filtered[0] ? deepClone(filtered[0]) : null) : state.currentCV,
        activeVersionId: isActive ? (filtered[0]?.id ?? null) : state.activeVersionId
      }
    })
  },

  updateSection: <K extends SectionKey>(key: K, value: CVSections[K]) => {
    set((state) => {
      if (!state.currentCV) return state
      const cloned = deepClone(state.currentCV)
      cloned.sections[key] = deepClone(value)
      cloned.updatedAt = new Date().toISOString()
      return { currentCV: cloned, isDirty: true }
    })
  },

  setJobInput: (jd: string) => {
    set((state) => {
      if (!state.currentCV) return state
      const cloned = deepClone(state.currentCV)
      cloned.jobInput = jd
      return { currentCV: cloned, isDirty: true }
    })
  },

  setVersionTitle: (title: string) => {
    set((state) => {
      if (!state.currentCV) return state
      const cloned = deepClone(state.currentCV)
      cloned.title = title
      return { currentCV: cloned, isDirty: true }
    })
  },

  loadFromJSON: (sections: CVSections, title = "Imported CV") => {
    const { createVersion } = get()
    createVersion(title, sections)
  },

  reset: () => {
    set({ currentCV: null, versions: [], activeVersionId: null, isDirty: false })
  }
}))
