// lib/hooks/useAutosave.ts
// Debounced autosave to localStorage + triggers saveVersion after inactivity

import { useEffect, useRef } from "react";
import { useCVStore } from "@/lib/store/cvStore";

const LS_KEY = "cv_builder_backup";
const AUTOSAVE_DELAY = 2000; // 2s inactivity → save

export function useAutosave() {
  const { currentCV, isDirty, saveVersion } = useCVStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    if (!isDirty) return;

    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ cv: currentCV, savedAt: Date.now() })
      );
    } catch (e) {
      console.error("[useAutosave] localStorage write failed", e);
    }

    // Debounce version save
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveVersion();
      console.debug("[useAutosave] autosaved");
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentCV, isDirty, saveVersion]);
}

export function restoreBackup(): { cv: unknown; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { cv: unknown; savedAt: number };
  } catch {
    return null;
  }
}
