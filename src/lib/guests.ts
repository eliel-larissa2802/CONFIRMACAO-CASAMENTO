import { supabase, type GuestRow } from './supabase'

export type { GuestRow }

export type RSVPResult = 'confirmed' | 'already_confirmed' | 'not_found'

export type ImportResult = {
  total: number
  added: number
  duplicates: number
}

const CONTACT_KEY = 'contact_link'

export function normalize(name: string): string {
  return name.trim().toLowerCase()
}

export async function getGuests(): Promise<GuestRow[]> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function confirmRSVP(name: string): Promise<RSVPResult> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .ilike('name', name.trim())

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return 'not_found'

  const guest: GuestRow = data[0]
  if (guest.confirmed) return 'already_confirmed'

  const { error: updateError } = await supabase
    .from('guests')
    .update({ confirmed: true })
    .eq('id', guest.id)

  if (updateError) throw new Error(updateError.message)
  return 'confirmed'
}

export async function addGuest(name: string): Promise<boolean> {
  const { data } = await supabase
    .from('guests')
    .select('id')
    .ilike('name', name.trim())

  if (data && data.length > 0) return false

  const { error } = await supabase
    .from('guests')
    .insert({ name: name.trim(), confirmed: false })

  if (error) throw new Error(error.message)
  return true
}

export async function editGuest(oldName: string, newName: string): Promise<boolean> {
  const { data: oldData } = await supabase
    .from('guests')
    .select('*')
    .ilike('name', oldName.trim())

  if (!oldData || oldData.length === 0) return false

  if (normalize(oldName) !== normalize(newName)) {
    const { data: existing } = await supabase
      .from('guests')
      .select('id')
      .ilike('name', newName.trim())
    if (existing && existing.length > 0) return false
  }

  const { error } = await supabase
    .from('guests')
    .update({ name: newName.trim() })
    .eq('id', oldData[0].id)

  if (error) throw new Error(error.message)
  return true
}

export async function removeGuest(id: string): Promise<void> {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function searchGuests(query: string, limit = 5): Promise<string[]> {
  const q = query.trim()
  if (!q) return []

  const { data, error } = await supabase
    .from('guests')
    .select('name')
    .ilike('name', `${q}%`)
    .limit(limit)

  if (error) return []
  return (data ?? []).map(r => r.name)
}

export async function importGuests(raw: string): Promise<ImportResult> {
  const lines = raw.split(/\r?\n/)

  const { data: existing } = await supabase.from('guests').select('name')
  const existingNorms = new Set((existing ?? []).map(r => normalize(r.name)))

  const toInsert: string[] = []
  let total = 0
  let duplicates = 0

  for (const line of lines) {
    const name = line.trim()
    if (!name) continue
    total++
    const norm = normalize(name)
    if (existingNorms.has(norm)) {
      duplicates++
    } else {
      toInsert.push(name)
      existingNorms.add(norm)
    }
  }

  if (toInsert.length > 0) {
    const rows = toInsert.map(name => ({ name, confirmed: false }))
    const { error } = await supabase.from('guests').insert(rows)
    if (error) throw new Error(error.message)
  }

  return { total, added: toInsert.length, duplicates }
}

// Contact link persistence moved to Supabase table `settings`.
// Expected table schema (SQL example to run in Supabase):
// create table settings (key text primary key, value text);

export async function getContactLink(): Promise<string> {
  try {
    const { data, error } = await supabase.from('settings').select('value').eq('key', CONTACT_KEY).limit(1).single()
    if (error) {
      // if table doesn't exist or other error, propagate empty string instead of throwing to avoid breaking UI
      console.warn('getContactLink supabase error:', error.message)
      return ''
    }
    return (data?.value as string) ?? ''
  } catch (err) {
    console.warn('getContactLink catch', err)
    return ''
  }
}

export async function setContactLink(url: string): Promise<void> {
  const trimmed = url.trim()
  try {
    // upsert into settings (key, value)
    const { error } = await supabase.from('settings').upsert({ key: CONTACT_KEY, value: trimmed }, { onConflict: 'key' })
    if (error) throw new Error(error.message)
  } catch (err) {
    console.warn('setContactLink error', err)
    throw err
  }
}
