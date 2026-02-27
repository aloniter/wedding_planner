import Papa from 'papaparse'
import type { Guest, GuestInsert, GuestSide } from './types'
import { generateId } from './utils'

const HEADER_MAP: Record<string, string> = {
  'name': 'שם',
  'full_name': 'שם',
  'שם מלא': 'שם',
  'phone': 'טלפון',
  'telephone': 'טלפון',
  'נייד': 'טלפון',
  'side': 'צד',
}

function validateSide(value?: string): GuestSide {
  if (!value) return 'משותף'
  const validSides: GuestSide[] = ['חתן', 'כלה', 'משותף']
  if (validSides.includes(value as GuestSide)) return value as GuestSide
  if (value.includes('חתן')) return 'חתן'
  if (value.includes('כלה')) return 'כלה'
  return 'משותף'
}

export function parseCsvFile(file: File, weddingId: string): Promise<GuestInsert[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      transformHeader: (header: string) => {
        const normalized = header.trim().toLowerCase()
        return HEADER_MAP[normalized] || header.trim()
      },
      complete: (results) => {
        const guests: GuestInsert[] = (results.data as Record<string, string>[])
          .filter((row) => row['שם']?.trim())
          .map((row) => ({
            wedding_id: weddingId,
            full_name: row['שם'].trim(),
            phone: row['טלפון']?.trim() || null,
            side: validateSide(row['צד']?.trim()),
            group_name: null,
            adults_count: 1,
            kids_count: 0,
            rsvp_status: 'ממתין' as const,
            notes: null,
          }))
        resolve(guests)
      },
      error: (error) => reject(error),
    })
  })
}

export function exportGuestsToCsv(guests: Guest[]): void {
  const exportData = guests.map(g => ({
    'שם': g.full_name,
    'טלפון': g.phone || '',
    'צד': g.side,
    'קבוצה': g.group_name || '',
    'מבוגרים': g.adults_count,
    'ילדים': g.kids_count,
    'סטטוס RSVP': g.rsvp_status,
    'הערות': g.notes || '',
  }))

  const csv = Papa.unparse(exportData, { header: true })
  // BOM for Hebrew Excel support
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `guests-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadCsvTemplate(): void {
  const template = 'שם,טלפון,צד\nמשפחת כהן,050-1234567,חתן\nשרה לוי,052-9876543,כלה\n'
  const bom = '\uFEFF'
  const blob = new Blob([bom + template], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'guest-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}
