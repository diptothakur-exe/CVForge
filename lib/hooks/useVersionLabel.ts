// lib/hooks/useVersionLabel.ts
// Generates a human-readable version label from CV state

import { useCVStore } from "@/lib/store/cvStore";

export function useVersionLabel(): string {
  const { versions } = useCVStore();
  const n = versions.length + 1;
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `v${n} · ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
}
