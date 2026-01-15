import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const SUPABASE_URL = 'https://nklwzunoipplfkysaztl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbHd6dW5vaXBwbGZreXNhenRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDIxMjAsImV4cCI6MjA3NzA3ODEyMH0.OYSO3RLcZjUjmSn9hH3bW2TerTsHK2mXeOWWUUQmA3g'

function isValidSupabaseUrl(value: string) {
  if (!value) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function createClient() {
  const envSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const envSupabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

  const supabaseUrl = isValidSupabaseUrl(envSupabaseUrl)
    ? envSupabaseUrl
    : SUPABASE_URL
  const supabaseAnonKey = envSupabaseAnonKey || SUPABASE_ANON_KEY

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
