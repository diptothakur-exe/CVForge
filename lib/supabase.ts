// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[Supabase] Missing env vars. DB features disabled.")
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "")

// Server-side client (for API routes using service role key)
export function createServerClient() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export type Database = {
  public: {
    Tables: {
      cv_versions: {
        Row: {
          id: string
          user_id: string
          title: string
          job_input: string | null
          sections: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["cv_versions"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["cv_versions"]["Insert"]>
      }
    }
  }
}
