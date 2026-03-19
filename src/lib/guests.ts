const GUESTS_KEY = 'wedding_guests'
const CONFIRMED_KEY = 'wedding_confirmed'
const CONTACT_KEY = 'contact_link'

export function getGuests(): string[] {
  const raw = localStorage.getItem(GUESTS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function setGuests(guests: string[]): void {
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests))
}

export function getConfirmed(): string[] {
  const raw = localStorage.getItem(CONFIRMED_KEY)
  return raw ? JSON.parse(raw) : []
}

export function setConfirmed(confirmed: string[]): void {
  localStorage.setItem(CONFIRMED_KEY, JSON.stringify(confirmed))
}

export function normalize(name: string): string {
  return name.trim().toLowerCase()
}

export type RSVPResult = 'confirmed' | 'already_confirmed' | 'not_found'

export function confirmRSVP(name: string): RSVPResult {
  const norm = normalize(name)
  const guests = getGuests()
  const confirmed = getConfirmed()

  const guestNorms = guests.map(normalize)
  const confirmedNorms = confirmed.map(normalize)

  if (!guestNorms.includes(norm)) return 'not_found'
  if (confirmedNorms.includes(norm)) return 'already_confirmed'

  confirmed.push(name.trim())
  setConfirmed(confirmed)
  return 'confirmed'
}

export function addGuest(name: string): boolean {
  const norm = normalize(name)
  const guests = getGuests()
  if (guests.map(normalize).includes(norm)) return false
  guests.push(name.trim())
  setGuests(guests)
  return true
}

export function editGuest(oldName: string, newName: string): boolean {
  const normOld = normalize(oldName)
  const normNew = normalize(newName)
  const guests = getGuests()
  const confirmed = getConfirmed()
  const guestNorms = guests.map(normalize)

  if (normOld !== normNew && guestNorms.includes(normNew)) return false

  const idx = guestNorms.indexOf(normOld)
  if (idx === -1) return false

  guests[idx] = newName.trim()
  setGuests(guests)

  const confirmIdx = confirmed.map(normalize).indexOf(normOld)
  if (confirmIdx !== -1) {
    confirmed[confirmIdx] = newName.trim()
    setConfirmed(confirmed)
  }

  return true
}

export function removeGuest(name: string): void {
  const norm = normalize(name)
  setGuests(getGuests().filter(g => normalize(g) !== norm))
  setConfirmed(getConfirmed().filter(g => normalize(g) !== norm))
}

export function getContactLink(): string {
  return localStorage.getItem(CONTACT_KEY) ?? ''
}

export function setContactLink(url: string): void {
  localStorage.setItem(CONTACT_KEY, url.trim())
}

export type ImportResult = {
  total: number
  added: number
  duplicates: number
}

export function searchGuests(query: string, limit = 5): string[] {
  const q = normalize(query)
  if (!q) return []
  return getGuests()
    .filter(g => normalize(g).startsWith(q))
    .slice(0, limit)
}

export function importGuests(raw: string): ImportResult {
  const lines = raw.split(/\r?\n/)
  const guests = getGuests()
  const existingNorms = new Set(guests.map(normalize))

  let added = 0
  let duplicates = 0
  let total = 0

  for (const line of lines) {
    const name = line.trim()
    if (!name) continue
    total++
    const norm = normalize(name)
    if (existingNorms.has(norm)) {
      duplicates++
    } else {
      guests.push(name)
      existingNorms.add(norm)
      added++
    }
  }

  if (added > 0) setGuests(guests)
  return { total, added, duplicates }
}
