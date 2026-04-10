// lib/diff.ts
import { diffWords } from "diff"
import type { CVSections, DiffResult } from "@/types/cv"

function diffStringField(
  oldVal: string,
  newVal: string
): DiffResult[string] {
  if (oldVal === newVal) return {}
  const changes = diffWords(oldVal, newVal).map((part) => ({
    type: part.added ? ("add" as const) : part.removed ? ("remove" as const) : ("equal" as const),
    value: part.value
  }))
  return { modified: true, changes }
}

function diffArrayField(
  oldArr: string[],
  newArr: string[]
): DiffResult[string] {
  const oldSet = new Set(oldArr)
  const newSet = new Set(newArr)

  const added = newArr.filter((x) => !oldSet.has(x))
  const removed = oldArr.filter((x) => !newSet.has(x))

  if (!added.length && !removed.length) return {}
  return {
    modified: added.length > 0 || removed.length > 0,
    added,
    removed
  }
}

export function computeDiff(
  oldSections: CVSections,
  newSections: CVSections
): DiffResult {
  const result: DiffResult = {}

  // Summary
  if (oldSections.summary !== newSections.summary) {
    result.summary = diffStringField(
      oldSections.summary ?? "",
      newSections.summary ?? ""
    )
  }

  // Skills
  const skillDiff = diffArrayField(
    oldSections.skills ?? [],
    newSections.skills ?? []
  )
  if (Object.keys(skillDiff).length) result.skills = skillDiff

  // Experience bullets
  const oldExp = oldSections.experience ?? []
  const newExp = newSections.experience ?? []
  const expDiffs: DiffResult = {}

  for (const newItem of newExp) {
    const oldItem = oldExp.find((e) => e.id === newItem.id)
    if (!oldItem) {
      expDiffs[newItem.id] = { added: newItem.bullets }
      continue
    }
    const bulletDiff = diffArrayField(oldItem.bullets, newItem.bullets)
    if (Object.keys(bulletDiff).length) expDiffs[newItem.id] = bulletDiff
  }
  if (Object.keys(expDiffs).length) result.experience = expDiffs as DiffResult[string]

  // Projects
  const oldProj = oldSections.projects ?? []
  const newProj = newSections.projects ?? []
  const projDiffs: DiffResult = {}

  for (const newItem of newProj) {
    const oldItem = oldProj.find((p) => p.id === newItem.id)
    if (!oldItem) {
      projDiffs[newItem.id] = { added: newItem.bullets }
      continue
    }
    const bulletDiff = diffArrayField(oldItem.bullets, newItem.bullets)
    if (Object.keys(bulletDiff).length) projDiffs[newItem.id] = bulletDiff
  }
  if (Object.keys(projDiffs).length) result.projects = projDiffs as DiffResult[string]

  return result
}

export function hasDiff(diff: DiffResult): boolean {
  return Object.keys(diff).length > 0
}
