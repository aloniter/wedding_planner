import Papa from 'papaparse'
import type { ImportedContact } from './types'

// Maps common CSV headers (lowercased) to our fields
const HEADER_MAP: Record<string, string> = {
  // Google Contacts
  'given name': 'firstName',
  'family name': 'lastName',
  'name': 'fullName',
  'phone 1 - value': 'phone',
  'e-mail 1 - value': 'email',
  // Generic English
  'first name': 'firstName',
  'last name': 'lastName',
  'full name': 'fullName',
  'mobile phone': 'phone',
  'phone': 'phone',
  'telephone': 'phone',
  'email': 'email',
  'email address': 'email',
  // Hebrew
  'שם פרטי': 'firstName',
  'שם משפחה': 'lastName',
  'שם מלא': 'fullName',
  'שם': 'fullName',
  'טלפון': 'phone',
  'נייד': 'phone',
  'אימייל': 'email',
}

export function parseContactsCsv(file: File): Promise<ImportedContact[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const contacts = (results.data as Record<string, string>[])
          .map(mapRowToContact)
          .filter((c): c is ImportedContact => c !== null)

        resolve(deduplicateByPhone(contacts))
      },
      error: (error: Error) => reject(error),
    })
  })
}

function mapRowToContact(row: Record<string, string>): ImportedContact | null {
  const mapped: Record<string, string> = {}

  for (const [header, value] of Object.entries(row)) {
    const key = HEADER_MAP[header.toLowerCase().trim()]
    if (key && value?.trim()) {
      mapped[key] = value.trim()
    }
  }

  let firstName = mapped.firstName || ''
  let lastName = mapped.lastName || ''
  let fullName = mapped.fullName || ''

  // If we have fullName but not first/last, split on last space
  if (fullName && !firstName && !lastName) {
    const lastSpace = fullName.lastIndexOf(' ')
    if (lastSpace > 0) {
      firstName = fullName.substring(0, lastSpace)
      lastName = fullName.substring(lastSpace + 1)
    } else {
      firstName = fullName
    }
  }

  // If we have first/last but not full, combine
  if (!fullName && (firstName || lastName)) {
    fullName = `${firstName} ${lastName}`.trim()
  }

  // Skip rows with no name at all
  if (!fullName) return null

  return {
    id: crypto.randomUUID(),
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    phone: normalizePhone(mapped.phone) || null,
    email: mapped.email || null,
    group_tag: null,
    source: 'google_csv',
    imported_at: new Date().toISOString(),
  }
}

function normalizePhone(phone: string | undefined): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  return cleaned || null
}

function deduplicateByPhone(contacts: ImportedContact[]): ImportedContact[] {
  const seen = new Set<string>()
  return contacts.filter((c) => {
    const key = c.phone || c.full_name
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
