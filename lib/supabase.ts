// lib/supabase.ts
// Singleton Supabase client — future auth + DB persistence layer
// Currently used for: (planned) version sync, user auth
// Safe to import now; won't throw if env vars are placeholder values

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Lazy singleton — avoids multiple client instances
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[supabase] Missing env vars. Supabase features will be unavailable."
    );
  }

  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return _client;
}

// Convenience re-export for direct usage
export const supabase = (() => {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
})();

// ── Future DB helpers ─────────────────────────────────────────
// These will be implemented when auth is wired up:
//
// export async function saveVersionToDb(version: CVVersion, userId: string) {}
// export async function fetchVersionsFromDb(userId: string): Promise<CVVersion[]> {}
// export async function deleteVersionFromDb(versionId: string) {}
