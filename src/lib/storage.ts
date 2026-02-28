import type { Wedding, Guest, Vendor, ImportedContact } from './types'

const KEYS = {
  wedding: 'wedding_data',
  guests: 'guests_data',
  vendors: 'vendors_data',
  contacts: 'contacts_data',
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

// Wedding
export function getStoredWedding(): Wedding | null {
  return getItem<Wedding>(KEYS.wedding)
}

export function setStoredWedding(wedding: Wedding): void {
  setItem(KEYS.wedding, wedding)
}

// Guests
export function getStoredGuests(): Guest[] {
  return getItem<Guest[]>(KEYS.guests) ?? []
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
