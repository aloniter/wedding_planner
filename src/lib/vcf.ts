import type { ImportedContact } from './types'

/**
 * Parse vCard (VCF) file text into ImportedContact[].
 * Handles vCard 3.0 (iPhone) and 4.0 (Android/Google),
 * including Quoted-Printable encoded Hebrew names.
 */
export function parseVcfText(text: string): ImportedContact[] {
  const blocks = text.split(/BEGIN:VCARD/i).slice(1)

  const parsed: (ImportedContact | null)[] = blocks.map((block) => {
    const fn = extractField(block, 'FN')
    const nField = extractField(block, 'N')
    const tel = extractBestPhone(block)
    const email = extractFirstEmail(block)

    const { firstName, lastName } = parseNames(fn, nField)
    const fullName = fn || `${firstName} ${lastName}`.trim()

    if (!fullName) return null

    return {
      id: crypto.randomUUID(),
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone: normalizePhone(tel),
      email: email || null,
      group_tag: null,
      source: 'vcf' as const,
      imported_at: new Date().toISOString(),
    }
  })

  return parsed.filter((c): c is ImportedContact => c !== null && c.full_name.trim().length > 0)
}

function extractField(block: string, fieldName: string): string | null {
  // Match field with optional parameters (e.g., FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:value)
  const regex = new RegExp(`^${fieldName}[;:](.*)$`, 'im')
  const match = block.match(regex)
  if (!match) return null

  let line = match[1]

  // Handle parameters before the actual value
  // e.g., ";CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:שרה כהן"
  const colonIdx = line.indexOf(':')
  const params = colonIdx >= 0 ? line.substring(0, colonIdx).toUpperCase() : ''
  const value = colonIdx >= 0 ? line.substring(colonIdx + 1) : line

  // Decode Quoted-Printable if needed (older iPhones use this for Hebrew)
  if (params.includes('QUOTED-PRINTABLE')) {
    return decodeQuotedPrintable(value).trim()
  }

  return value.trim()
}

function extractBestPhone(block: string): string | null {
  const lines = block.split(/\r?\n/)
  let cellPhone: string | null = null
  let firstPhone: string | null = null

  for (const line of lines) {
    if (!line.toUpperCase().startsWith('TEL')) continue

    const colonIdx = line.indexOf(':')
    if (colonIdx < 0) continue

    const params = line.substring(0, colonIdx).toUpperCase()
    const value = line.substring(colonIdx + 1).trim()

    if (!value) continue

    if (!firstPhone) firstPhone = value

    // Prefer CELL/MOBILE/iPhone types
    if (params.includes('CELL') || params.includes('MOBILE') || params.includes('IPHONE')) {
      cellPhone = value
    }
  }

  return cellPhone || firstPhone
}

function extractFirstEmail(block: string): string | null {
  const lines = block.split(/\r?\n/)
  for (const line of lines) {
    if (!line.toUpperCase().startsWith('EMAIL')) continue
    const colonIdx = line.indexOf(':')
    if (colonIdx < 0) continue
    const value = line.substring(colonIdx + 1).trim()
    if (value) return value
  }
  return null
}

function parseNames(
  fn: string | null,
  nField: string | null
): { firstName: string; lastName: string } {
  // N field format: LastName;FirstName;Additional;Prefix;Suffix
  if (nField) {
    // Remove parameter prefix if present (e.g., ";CHARSET=UTF-8:Cohen;Sarah")
    let value = nField
    const colonIdx = nField.indexOf(':')
    if (colonIdx >= 0) value = nField.substring(colonIdx + 1)

    const parts = value.split(';')
    const lastName = (parts[0] || '').trim()
    const firstName = (parts[1] || '').trim()

    if (firstName || lastName) {
      return { firstName, lastName }
    }
  }

  // Fallback: split FN on last space
  if (fn) {
    const trimmed = fn.trim()
    const lastSpace = trimmed.lastIndexOf(' ')
    if (lastSpace > 0) {
      return {
        firstName: trimmed.substring(0, lastSpace),
        lastName: trimmed.substring(lastSpace + 1),
      }
    }
    return { firstName: trimmed, lastName: '' }
  }

  return { firstName: '', lastName: '' }
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null
  // Keep only digits, +, and leading plus
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  return cleaned || null
}

function decodeQuotedPrintable(input: string): string {
  // Join continuation lines (lines ending with =)
  const joined = input.replace(/=\r?\n/g, '')

  const bytes: number[] = []
  let i = 0
  while (i < joined.length) {
    if (joined[i] === '=' && i + 2 < joined.length) {
      const hex = joined.substring(i + 1, i + 3)
      const byte = parseInt(hex, 16)
      if (!isNaN(byte)) {
        bytes.push(byte)
        i += 3
        continue
      }
    }
    bytes.push(joined.charCodeAt(i))
    i++
  }

  return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
}
