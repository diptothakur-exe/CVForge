// lib/api/diff.ts
// Section-level diff between two CV versions

import { diffWords, Change } from "diff";
import { CVData, CVDiff, SectionDiff } from "@/lib/types/cv";

function diffStrings(oldStr: string, newStr: string): SectionDiff {
  const changes: Change[] = diffWords(oldStr, newStr);
  const added: string[] = [];
  const removed: string[] = [];

  for (const c of changes) {
    if (c.added) added.push(c.value);
    if (c.removed) removed.push(c.value);
  }

  return {
    added,
    removed,
    modified: added.length > 0 || removed.length > 0,
  };
}

function diffArrays(oldArr: string[], newArr: string[]): SectionDiff {
  const oldSet = new Set(oldArr);
  const newSet = new Set(newArr);

  return {
    added: newArr.filter((x) => !oldSet.has(x)),
    removed: oldArr.filter((x) => !newSet.has(x)),
    modified: false,
  };
}

// Sample input/output:
// oldCV.summary = "Software engineer with 3 years"
// newCV.summary = "Software engineer with 5 years of experience"
// output: { summary: { added: ["5 years of experience"], removed: ["3 years"], modified: true } }

export function computeDiff(oldCV: CVData, newCV: CVData): CVDiff {
  const result: CVDiff = {};

  // Summary
  if (oldCV.summary !== newCV.summary) {
    result.summary = diffStrings(oldCV.summary, newCV.summary);
  }

  // Skills (array of strings)
  const skillsDiff = diffArrays(oldCV.skills, newCV.skills);
  if (skillsDiff.added.length || skillsDiff.removed.length) {
    result.skills = skillsDiff;
  }

  // Experience bullets
  const expDiff: Record<string, SectionDiff> = {};
  for (const newExp of newCV.experience) {
    const oldExp = oldCV.experience.find((e) => e.id === newExp.id);
    if (!oldExp) {
      expDiff[newExp.id] = { added: newExp.bullets, removed: [], modified: true };
      continue;
    }
    const bd = diffArrays(oldExp.bullets, newExp.bullets);
    if (bd.added.length || bd.removed.length) {
      expDiff[newExp.id] = bd;
    }
  }
  if (Object.keys(expDiff).length) result.experience = expDiff as never;

  // Projects
  const projDiff: Record<string, SectionDiff> = {};
  for (const newProj of newCV.projects) {
    const oldProj = oldCV.projects.find((p) => p.id === newProj.id);
    if (!oldProj) {
      projDiff[newProj.id] = {
        added: [newProj.description],
        removed: [],
        modified: true,
      };
      continue;
    }
    if (oldProj.description !== newProj.description) {
      projDiff[newProj.id] = diffStrings(
        oldProj.description,
        newProj.description
      );
    }
  }
  if (Object.keys(projDiff).length) result.projects = projDiff as never;

  return result;
}
