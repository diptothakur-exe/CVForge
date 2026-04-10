// types/cv.ts

export interface CVBasics {
  name: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  website?: string
  title?: string
}

export interface CVExperienceItem {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
  projectRefs?: string[]
}

export interface CVEducationItem {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
}

export interface CVProject {
  id: string
  name: string
  description: string
  tech: string[]
  url?: string
  bullets: string[]
}

export interface CVSections {
  basics: CVBasics
  summary: string
  experience: CVExperienceItem[]
  education: CVEducationItem[]
  skills: string[]
  projects: CVProject[]
  certifications?: string[]
  languages?: string[]
}

export interface CVVersion {
  id: string
  title: string
  jobInput?: string
  sections: CVSections
  createdAt: string
  updatedAt: string
}

export interface DiffResult {
  [section: string]: {
    modified?: boolean
    added?: string[]
    removed?: string[]
    changes?: Array<{ type: "add" | "remove" | "equal"; value: string }>
  }
}

export interface SkillMatchResult {
  matchScore: number
  matched: string[]
  missing: string[]
  suggestions: string[]
}

export type SectionKey = keyof CVSections
