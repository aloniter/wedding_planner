import type { ImportedContact } from './types'

/**
 * Maps Contact Picker API response to ImportedContact[]
 * Only available on Android Chrome 80+ and Samsung Internet 11.2+
 */
export async function getContactsFromPicker(): Promise<ImportedContact[]> {
  if (!('contacts' in navigator)) {
    throw new Error('Contact Picker API is not supported on this device')
  }

  try {
    const contacts = await navigator.contacts!.select(
      ['name', 'tel', 'email'],
      { multiple: true }
    )

    const mapped: (ImportedContact | null)[] = contacts.map((contact) => {
      const firstName = contact.name?.[0]?.split(' ')[0] || ''
      const lastName = contact.name?.[0]?.split(' ').slice(1).join(' ') || ''
      const fullName = contact.name?.[0] || ''
      const phone = contact.tel?.[0] || null
      const email = contact.email?.[0] || null

      if (!fullName) return null

      return {
        id: crypto.randomUUID(),
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone: normalizePhone(phone),
        email: email || null,
        group_tag: null,
        source: 'vcf' as const,
        imported_at: new Date().toISOString(),
      }
    })

    return mapped.filter((c): c is ImportedContact => c !== null)
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled the picker
      return []
    }
    throw error
  }
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  return cleaned || null
}

/**
 * Check if Contact Picker API is available
 * Returns true only on supported Android/Samsung browsers
 */
export function isContactPickerSupported(): boolean {
  return 'contacts' in navigator
}
