import { utils, writeFileXLSX } from 'xlsx'
import type { ImportedContact } from './types'

export function exportContactsToExcel(
  contacts: ImportedContact[],
  filename?: string
): void {
  const rows = contacts.map((c) => ({
    'שם פרטי': c.first_name,
    'שם משפחה': c.last_name,
    'טלפון': c.phone || '',
    'אימייל': c.email || '',
    'קבוצה': c.group_tag || '',
  }))

  const worksheet = utils.json_to_sheet(rows)

  // Column widths for readability
  worksheet['!cols'] = [
    { wch: 16 }, // שם פרטי
    { wch: 16 }, // שם משפחה
    { wch: 18 }, // טלפון
    { wch: 26 }, // אימייל
    { wch: 14 }, // קבוצה
  ]

  // RTL sheet direction
  if (!worksheet['!sheetViews']) {
    (worksheet as Record<string, unknown>)['!sheetViews'] = [{ rightToLeft: true }]
  }

  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'אנשי קשר')

  const date = new Date().toISOString().split('T')[0]
  writeFileXLSX(workbook, filename ?? `contacts-${date}.xlsx`)
}
