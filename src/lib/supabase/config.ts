// The only place the app learns which Supabase project it talks to.
// Until 2026-10-05 client.ts, server.ts and middleware.ts each carried a hardcoded fallback
// URL + anon key, so a missing env var silently pointed the app at the shared project.
// Now a missing or malformed value fails loudly at startup instead.

const URL_VAR = 'NEXT_PUBLIC_SUPABASE_URL'
const KEY_VAR = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

export type SupabaseConfig = { url: string; anonKey: string }

let cached: SupabaseConfig | null = null

export function getSupabaseConfig(): SupabaseConfig {
  if (cached) return cached

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

  const missing = [!url && URL_VAR, !anonKey && KEY_VAR].filter(Boolean)
  if (missing.length) {
    throw new Error(
      `Supabase is not configured: set ${missing.join(' and ')} (see .env.example). ` +
        'In Vercel: Project > Settings > Environment Variables.'
    )
  }
  try {
    new URL(url)
  } catch {
    throw new Error(`${URL_VAR} is not a valid URL: "${url}"`)
  }

  cached = { url, anonKey }
  return cached
}
