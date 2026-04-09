// lib/types/cv.ts

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  projectIds?: string[]; // linked portfolio projects
}

export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface CVProject {
  id: string;
  name: string;
  description: string;
  url?: string;
  techStack: string[];
  bullets: string[];
}

export interface CVData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
  projects: CVProject[];
  createdAt: string;
  updatedAt: string;
}

export interface CVVersion {
  id: string;
  label: string;
  snapshot: CVData;
  createdAt: string;
}

export type SectionKey = keyof Omit<CVData, "id" | "createdAt" | "updatedAt">;

// Diff types
export interface SectionDiff {
  added: string[];
  removed: string[];
  modified: boolean;
}

export interface CVDiff {
  [section: string]: SectionDiff | { bullets?: SectionDiff; modified?: boolean };
}

// AI types
export interface AIRewriteInput {
  section: SectionKey;
  content: string | string[];
  jd?: string; // job description for matching
}

export interface AIRewriteOutput {
  updatedContent: string | string[];
}

export interface SkillMatchResult {
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}
