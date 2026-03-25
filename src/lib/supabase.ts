import { createClient } from '@supabase/supabase-js'

// Supabase connection using Vite env variables. Do NOT hardcode keys here.
const _env = (import.meta as any).env ?? {}
const SUPABASE_URL = _env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = _env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Warn in development if env vars are missing.
  // In production, these should be provided via environment variables.
  // Do not commit any secrets to the repository.
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)

export type GuestRow = {
  id: string
  name: string
  confirmed: boolean
}
import { createClient } from '@supabase/supabase-js'

// Prefer environment variables (Vite: VITE_SUPABASE_*) to avoid hardcoding secrets in source.
const _env = (import.meta as any).env ?? {}
const SUPABASE_URL = _env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = _env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Don't throw here to avoid breaking dev builds; warn so developer configures .env
  // The actual values MUST be provided via environment variables in production.
  // See .env.example for the expected variables.
  // NOTE: the anonymous key must never be committed to the repository.
  // This file intentionally does not contain any secret fallback values.
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)

export type GuestRow = {
  id: string
  name: string
  confirmed: boolean
}
