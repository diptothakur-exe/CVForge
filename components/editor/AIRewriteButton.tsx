// components/editor/AIRewriteButton.tsx
"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIRewriteButtonProps {
  onRewrite: () => Promise<void>;
  label?: string;
}

export function AIRewriteButton({ onRewrite, label = "AI Rewrite" }: AIRewriteButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onRewrite();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-border hover:bg-secondary transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      )}
      {loading ? "Rewriting…" : label}
    </button>
  );
}
