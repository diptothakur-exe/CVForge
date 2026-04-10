// hooks/useAutosave.ts
import { useEffect, useRef } from "react"
import { useCVStore } from "@/store/cvStore"

const AUTOSAVE_DELAY = 2000
const STORAGE_KEY = "forgecv_backup"

export function useAutosave() {
  const { currentCV, isDirty, saveVersion } = useCVStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced autosave to store
  useEffect(() => {
    if (!isDirty || !currentCV) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveVersion()
      // Backup to localStorage
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ cv: currentCV, savedAt: Date.now() })
        )
      } catch (_) {}
    }, AUTOSAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentCV, isDirty, saveVersion])

  return null
}

export function restoreFromLocalStorage(): {
  cv: import("@/types/cv").CVVersion
  savedAt: number
} | null {
  try {
    const raw = localStorage.getItem("forgecv_backup")
    if (!raw) return null
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}
