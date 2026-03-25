import { createClient } from '@supabase/supabase-js'

// Pegando variáveis de ambiente do Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase env vars não configuradas!')
}

export const supabase = createClient(
  SUPABASE_URL as string,
  SUPABASE_ANON_KEY as string
)

// Tipagem
export type GuestRow = {
  id: string
  name: string
  confirmed: boolean
}