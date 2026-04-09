// components/editor/BulletList.tsx
"use client";

import { Plus, X } from "lucide-react";

interface BulletListProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}

export function BulletList({ bullets, onChange }: BulletListProps) {
  function update(index: number, value: string) {
    const updated = [...bullets];
    updated[index] = value;
    onChange(updated);
  }

  function remove(index: number) {
    onChange(bullets.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...bullets, ""]);
  }

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm select-none">•</span>
          <input
            type="text"
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Add bullet…"
            className="flex-1 text-sm border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
      >
        <Plus className="w-3 h-3" /> Add bullet
      </button>
    </div>
  );
}
