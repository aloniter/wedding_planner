import type { Wedding, Guest, Vendor, ImportedContact, WeddingTable, GuestCategory } from './types'

const KEYS = {
  wedding: 'wedding_data',
  guests: 'guests_data',
  vendors: 'vendors_data',
  contacts: 'contacts_data',
  tables: 'tables_data',
  categories: 'categories_data',
} as const

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Wedding (with migration for new fields)
export function getStoredWedding(): Wedding | null {
  const w = getItem<Record<string, unknown>>(KEYS.wedding)
  if (!w) return null
  return {
    ...w,
    estimated_guests: w.estimated_guests ?? null,
  } as Wedding
}

export function setStoredWedding(wedding: Wedding): void {
  setItem(KEYS.wedding, wedding)
}

// Guests (with migration for new fields)
export function getStoredGuests(): Guest[] {
  const guests = getItem<Record<string, unknown>[]>(KEYS.guests) ?? []
  return guests.map(g => ({
    ...g,
    gift_amount: g.gift_amount ?? null,
    table_id: g.table_id ?? null,
  })) as Guest[]
}

export function setStoredGuests(guests: Guest[]): void {
  setItem(KEYS.guests, guests)
}

// Vendors
export function getStoredVendors(): Vendor[] {
  return getItem<Vendor[]>(KEYS.vendors) ?? []
}

export function setStoredVendors(vendors: Vendor[]): void {
  setItem(KEYS.vendors, vendors)
}

// Contacts
export function getStoredContacts(): ImportedContact[] {
  return getItem<ImportedContact[]>(KEYS.contacts) ?? []
}

export function setStoredContacts(contacts: ImportedContact[]): void {
  setItem(KEYS.contacts, contacts)
}

// Tables
export function getStoredTables(): WeddingTable[] {
  return getItem<WeddingTable[]>(KEYS.tables) ?? []
}

export function setStoredTables(tables: WeddingTable[]): void {
  setItem(KEYS.tables, tables)
}

// Categories
export function getStoredCategories(): GuestCategory[] {
  return getItem<GuestCategory[]>(KEYS.categories) ?? []
}

export function setStoredCategories(categories: GuestCategory[]): void {
  setItem(KEYS.categories, categories)
}
