import Papa from 'papaparse'
import { read, utils } from 'xlsx'
import type { Guest, GuestInsert, GuestSide, RsvpStatus } from './types'

type ImportField =
  | 'full_name'
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'side'
  | 'group_name'
  | 'adults_count'
  | 'kids_count'
  | 'rsvp_status'
  | 'notes'
  | 'attending_count'

interface GuestImportOptions {
  groomName?: string | null
  brideName?: string | null
}

const FIELD_ALIASES: Record<ImportField, string[]> = {
  full_name: ['שם', 'שםמלא', 'full_name', 'fullname', 'name', 'guestname'],
  first_name: ['שםפרטי', 'firstname', 'first_name', 'first'],
  last_name: ['שםמשפחה', 'lastname', 'last_name', 'last'],
  phone: ['טלפון', 'נייד', 'פלאפון', 'phone', 'telephone', 'mobile'],
  side: ['צד', 'side'],
  group_name: ['קבוצה', 'group', 'groupname', 'קשר', 'relationship'],
  adults_count: ['מוזמנים', 'מסמוזמנים', 'כמותמוזמנים', 'מבוגרים', 'adults', 'guestcount'],
  kids_count: ['ילדים', 'כמותילדים', 'kids', 'children'],
  rsvp_status: ['סטטוסrsvp', 'rsvp', 'סטטוס', 'status'],
  notes: ['הערות', 'notes', 'note'],
  attending_count: ['מגיעים', 'מסמגיעים', 'כמותמגיעים', 'attending', 'arriving'],
}

const HEADER_LOOKUP: Record<string, ImportField> = Object.entries(FIELD_ALIASES).reduce(
  (acc, [field, aliases]) => {
    for (const alias of aliases) {
      acc[normalizeHeader(alias)] = field as ImportField
    }
    return acc
  },
  {} as Record<string, ImportField>
)

interface HeaderDetectionResult {
  headerRowIndex: number
  score: number
}

interface ExcelSheetCandidate {
  score: number
  rowCount: number
  headers: string[]
  rows: Record<string, unknown>[]
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9\u0590-\u05ff]/g, '')
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\u00a0/g, ' ').trim()
}

function toOptionalText(value: unknown): string | null {
  const trimmed = toText(value)
  return trimmed ? trimmed : null
}

function resolveField(header: string): ImportField | null {
  if (!header) return null
  return HEADER_LOOKUP[normalizeHeader(header)] ?? null
}

function buildHeaderMapping(headers: string[]): Partial<Record<ImportField, string>> {
  const mapping: Partial<Record<ImportField, string>> = {}

  for (const header of headers) {
    const field = resolveField(header)
    if (field && !mapping[field]) {
      mapping[field] = header
    }
  }

  return mapping
}

function scoreHeaderRow(row: unknown[]): number {
  const found = new Set<ImportField>()

  for (const cell of row) {
    const field = resolveField(toText(cell))
    if (field) found.add(field)
  }

  let score = found.size
  if (found.has('full_name')) score += 2
  if (found.has('first_name')) score += 1
  if (found.has('phone')) score += 1
  if (found.has('adults_count')) score += 1
  return score
}

function detectHeaderRow(rows: unknown[][]): HeaderDetectionResult {
  let best: HeaderDetectionResult = { headerRowIndex: -1, score: 0 }

  const maxRowsToScan = Math.min(rows.length, 25)
  for (let i = 0; i < maxRowsToScan; i++) {
    const score = scoreHeaderRow(rows[i] ?? [])
    if (score > best.score) {
      best = { headerRowIndex: i, score }
    }
  }

  return best
}

function extractRowsFromSheet(
  rows: unknown[][],
  headerRowIndex: number
): { headers: string[]; dataRows: Record<string, unknown>[] } {
  const rawHeaderRow = rows[headerRowIndex] ?? []
  const columnDefs = rawHeaderRow
    .map((headerCell, index) => ({
      index,
      header: toText(headerCell),
    }))
    .filter((column) => column.header.length > 0)

  const headers = columnDefs.map((column) => column.header)
  const dataRows: Record<string, unknown>[] = []

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const sourceRow = rows[rowIndex] ?? []
    const row: Record<string, unknown> = {}
    let hasContent = false

    for (const column of columnDefs) {
      const value = sourceRow[column.index]
      row[column.header] = value
      if (toText(value)) hasContent = true
    }

    if (hasContent) dataRows.push(row)
  }

  return { headers, dataRows }
}

function detectBestExcelSheet(file: File): Promise<ExcelSheetCandidate> {
  return file.arrayBuffer().then((buffer) => {
    const workbook = read(buffer, { type: 'array' })
    let bestCandidate: ExcelSheetCandidate | null = null

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) continue

      const rawRows = utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
        raw: false,
      }) as unknown[][]

      if (rawRows.length === 0) continue

      const { headerRowIndex, score } = detectHeaderRow(rawRows)
      if (headerRowIndex < 0 || score < 2) continue

      const { headers, dataRows } = extractRowsFromSheet(rawRows, headerRowIndex)
      if (headers.length === 0 || dataRows.length === 0) continue

      const candidate: ExcelSheetCandidate = {
        score,
        rowCount: dataRows.length,
        headers,
        rows: dataRows,
      }

      if (
        !bestCandidate ||
        candidate.score > bestCandidate.score ||
        (candidate.score === bestCandidate.score && candidate.rowCount > bestCandidate.rowCount)
      ) {
        bestCandidate = candidate
      }
    }

    if (!bestCandidate) {
      throw new Error('NO_IMPORTABLE_SHEET')
    }

    return bestCandidate
  })
}

function parseCount(value: unknown, fallback: number): number {
  const raw = toText(value)
  if (!raw) return fallback

  const numeric = Number(raw.replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(numeric) || numeric < 0) return fallback
  return Math.round(numeric)
}

function normalizeCompare(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

function matchesAlias(value: string, aliases: string[]): boolean {
  const normalizedValue = normalizeCompare(value)
  if (!normalizedValue) return false

  return aliases.some((alias) => {
    const normalizedAlias = normalizeCompare(alias)
    if (!normalizedAlias) return false
    return (
      normalizedValue.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedValue)
    )
  })
}

function createNameAliases(name?: string | null): string[] {
  if (!name) return []
  const trimmed = name.trim()
  if (!trimmed) return []

  const firstWord = trimmed.split(/\s+/)[0]
  return Array.from(new Set([trimmed, firstWord]))
}

function validateSide(
  value: unknown,
  options?: GuestImportOptions
): GuestSide {
  const side = toText(value)
  if (!side) return 'משותף'

  if (side.includes('חתן') || side.toLowerCase().includes('groom')) return 'חתן'
  if (side.includes('כלה') || side.toLowerCase().includes('bride')) return 'כלה'
  if (
    side.includes('משותף') ||
    side.includes('שניהם') ||
    side.toLowerCase().includes('both')
  ) {
    return 'משותף'
  }

  const groomAliases = createNameAliases(options?.groomName)
  const brideAliases = createNameAliases(options?.brideName)
  const isGroomSide = matchesAlias(side, groomAliases)
  const isBrideSide = matchesAlias(side, brideAliases)

  if (isGroomSide && isBrideSide) return 'משותף'
  if (isGroomSide) return 'חתן'
  if (isBrideSide) return 'כלה'

  return 'משותף'
}

function validateRsvpStatus(value: unknown): RsvpStatus {
  const status = toText(value).toLowerCase()
  if (!status) return 'ממתין'

  if (status.includes('אישר') || status.includes('confirm') || status.includes('yes')) {
    return 'אישר'
  }

  if (
    status.includes('ביטל') ||
    status.includes('סירב') ||
    status.includes('declin') ||
    status === 'לא'
  ) {
    return 'ביטל'
  }

  return 'ממתין'
}

function mapRowsToGuests(
  rows: Record<string, unknown>[],
  headers: string[],
  weddingId: string,
  options?: GuestImportOptions
): GuestInsert[] {
  const mapping = buildHeaderMapping(headers)

  return rows
    .map((row) => {
      const fullName = toText(row[mapping.full_name ?? ''])
      const firstName = toText(row[mapping.first_name ?? ''])
      const lastName = toText(row[mapping.last_name ?? ''])
      const composedName = [firstName, lastName].filter(Boolean).join(' ').trim()
      const guestName = fullName || composedName

      if (!guestName) return null

      const adultsRaw = row[mapping.adults_count ?? '']
      const attendingRaw = row[mapping.attending_count ?? '']

      return {
        wedding_id: weddingId,
        full_name: guestName,
        phone: toOptionalText(row[mapping.phone ?? '']),
        side: validateSide(row[mapping.side ?? ''], options),
        group_name: toOptionalText(row[mapping.group_name ?? '']),
        adults_count: parseCount(adultsRaw || attendingRaw, 1),
        kids_count: parseCount(row[mapping.kids_count ?? ''], 0),
        rsvp_status: validateRsvpStatus(row[mapping.rsvp_status ?? '']),
        notes: toOptionalText(row[mapping.notes ?? '']),
      } satisfies GuestInsert
    })
    .filter((guest): guest is GuestInsert => guest !== null)
}

export function parseCsvFile(
  file: File,
  weddingId: string,
  options?: GuestImportOptions
): Promise<GuestInsert[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const headers = results.meta.fields ?? []
        const rows = results.data as Record<string, unknown>[]
        resolve(mapRowsToGuests(rows, headers, weddingId, options))
      },
      error: (error) => reject(error),
    })
  })
}

async function parseExcelFile(
  file: File,
  weddingId: string,
  options?: GuestImportOptions
): Promise<GuestInsert[]> {
  const bestSheet = await detectBestExcelSheet(file)
  return mapRowsToGuests(bestSheet.rows, bestSheet.headers, weddingId, options)
}

export async function parseGuestImportFile(
  file: File,
  weddingId: string,
  options?: GuestImportOptions
): Promise<GuestInsert[]> {
  const extension = file.name.toLowerCase().split('.').pop()

  if (extension === 'csv') {
    return parseCsvFile(file, weddingId, options)
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file, weddingId, options)
  }

  throw new Error('UNSUPPORTED_FILE_TYPE')
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
