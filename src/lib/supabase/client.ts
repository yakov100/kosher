import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getSupabaseConfig } from './config'


// Singleton pattern - reuse the same client instance
let supabaseClient: SupabaseClient<Database> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig()

  supabaseClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )

  return supabaseClient
}
