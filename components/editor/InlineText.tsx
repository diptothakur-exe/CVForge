// components/editor/InlineText.tsx
"use client";

interface InlineTextProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function InlineText({ label, value, onChange, placeholder }: InlineTextProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-muted-foreground capitalize">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="text-sm border border-border rounded px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring w-full"
      />
    </div>
  );
}
