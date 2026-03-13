import ExcelJS from 'exceljs'
import { GUEST_SIDES, RSVP_STATUSES } from './constants'
import type { Guest, GuestInsert, GuestSide, RsvpStatus } from './types'

export type GuestExcelColumnKey =
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'side'
  | 'group_name'
  | 'adults_count'
  | 'kids_count'
  | 'rsvp_status'
  | 'gift_amount'
  | 'notes'

type GuestImportField = GuestExcelColumnKey | 'full_name' | 'attending_count'

interface GuestExcelColumnDefinition {
  key: GuestExcelColumnKey
  header: string
  width: number
}

export interface GuestImportOptions {
  groomName?: string | null
  brideName?: string | null
}

export interface GuestImportSourceRow {
  rowNumber: number
  values: Record<string, unknown>
}

export interface GuestImportError {
  rowNumber: number
  messages: string[]
}

export interface GuestImportParseResult {
  guests: GuestInsert[]
  errors: GuestImportError[]
}

type GuestExcelValue = string | number | null

const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const GUEST_SHEET_NAME = 'אורחים'
const GUEST_TEMPLATE_FILENAME = 'תבנית-אורחים.xlsx'
const VALIDATION_ROW_COUNT = 500
const HEADER_ROW = 1
const SIDE_VALUES = GUEST_SIDES.map((side) => side.value)
const RSVP_VALUES = RSVP_STATUSES.map((status) => status.value)

export const GUEST_EXCEL_COLUMNS: GuestExcelColumnDefinition[] = [
  { key: 'first_name', header: 'שם פרטי', width: 18 },
  { key: 'last_name', header: 'שם משפחה', width: 18 },
  { key: 'phone', header: 'טלפון', width: 16 },
  { key: 'side', header: 'צד', width: 12 },
  { key: 'group_name', header: 'קשר', width: 18 },
  { key: 'adults_count', header: 'מבוגרים', width: 12 },
  { key: 'kids_count', header: 'ילדים', width: 10 },
  { key: 'rsvp_status', header: 'סטטוס RSVP', width: 16 },
  { key: 'gift_amount', header: 'מתנה', width: 12 },
  { key: 'notes', header: 'הערות', width: 28 },
]

const FIELD_ALIASES: Record<GuestImportField, string[]> = {
  full_name: ['שם', 'שם מלא', 'שםמלא', 'full_name', 'fullname', 'name', 'guestname'],
  first_name: ['שם פרטי', 'שםפרטי', 'firstname', 'first_name', 'first'],
  last_name: ['שם משפחה', 'שםמשפחה', 'lastname', 'last_name', 'last'],
  phone: ['טלפון', 'נייד', 'פלאפון', 'phone', 'telephone', 'mobile'],
  side: ['צד', 'side'],
  group_name: ['קשר', 'קטגוריה', 'קבוצה', 'group', 'groupname', 'relationship', 'category'],
  adults_count: ['מבוגרים', '# מוזמנים', '#מוזמנים', 'מוזמנים', 'מסמוזמנים', 'כמותמוזמנים', 'adults', 'guestcount'],
  kids_count: ['ילדים', 'כמותילדים', 'kids', 'children'],
  rsvp_status: ['סטטוס RSVP', 'סטטוסrsvp', 'rsvp', 'סטטוס', 'status'],
  gift_amount: ['מתנה', 'סכוםמתנה', 'gift', 'giftamount'],
  notes: ['הערות', 'notes', 'note'],
  attending_count: ['# מגיעים', '#מגיעים', 'מגיעים', 'מסמגיעים', 'כמותמגיעים', 'attending', 'arriving'],
}

const HEADER_LOOKUP: Record<string, GuestImportField> = Object.entries(FIELD_ALIASES).reduce(
  (acc, [field, aliases]) => {
    for (const alias of aliases) {
      acc[normalizeHeader(alias)] = field as GuestImportField
    }
    return acc
  },
  {} as Record<string, GuestImportField>
)

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
  const text = toText(value)
  return text ? text : null
}

function isBlankValue(value: unknown): boolean {
  return toText(value).length === 0
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

function normalizeDelimitedInteger(raw: string): string {
  return raw
    .replace(/₪/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
}

function parseNonNegativeInteger(
  value: unknown,
  label: string,
  defaultValue: number
): { value: number; error?: string } {
  const raw = toText(value)
  if (!raw) return { value: defaultValue }

  const normalized = normalizeDelimitedInteger(raw)
  if (!/^-?\d+(?:\.0+)?$/.test(normalized)) {
    return { value: defaultValue, error: `${label} חייב להיות מספר שלם תקין` }
  }

  const numeric = Number(normalized)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return { value: defaultValue, error: `${label} חייב להיות 0 או יותר` }
  }

  return { value: numeric }
}

function parseOptionalNonNegativeInteger(
  value: unknown,
  label: string
): { value: number | null; error?: string } {
  const raw = toText(value)
  if (!raw) return { value: null }

  const normalized = normalizeDelimitedInteger(raw)
  if (!/^-?\d+(?:\.0+)?$/.test(normalized)) {
    return { value: null, error: `${label} חייב להיות מספר שלם תקין` }
  }

  const numeric = Number(normalized)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return { value: null, error: `${label} חייב להיות 0 או יותר` }
  }

  return { value: numeric }
}

function listFormula(values: string[]): string {
  return `"${values.join(',')}"`
}

function formatDateSuffix(date: Date): string {
  return date.toISOString().split('T')[0]
}

function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  return workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  })
}

function applyHeaderStyles(worksheet: ExcelJS.Worksheet): void {
  const headerRow = worksheet.getRow(HEADER_ROW)
  headerRow.height = 24

  GUEST_EXCEL_COLUMNS.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = column.header
    cell.font = { bold: true, size: 11, color: { argb: 'FF1F2937' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5E7DB' },
    }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFD6BFA8' } },
    }
  })
}

function applyColumnStyles(worksheet: ExcelJS.Worksheet): void {
  GUEST_EXCEL_COLUMNS.forEach((column, index) => {
    const sheetColumn = worksheet.getColumn(index + 1)
    sheetColumn.width = column.width

    if (column.key === 'phone') {
      sheetColumn.alignment = { horizontal: 'right' }
    }

    if (column.key === 'adults_count' || column.key === 'kids_count') {
      sheetColumn.alignment = { horizontal: 'center' }
      sheetColumn.numFmt = '0'
    }

    if (column.key === 'gift_amount') {
      sheetColumn.alignment = { horizontal: 'center' }
      sheetColumn.numFmt = '#,##0'
    }
  })
}

function applyDataValidations(worksheet: ExcelJS.Worksheet, guestCount: number): void {
  const validationEndRow = Math.max(guestCount + 50, VALIDATION_ROW_COUNT + 1)
  const sideColumnIndex = GUEST_EXCEL_COLUMNS.findIndex((column) => column.key === 'side') + 1
  const rsvpColumnIndex = GUEST_EXCEL_COLUMNS.findIndex((column) => column.key === 'rsvp_status') + 1

  for (let rowNumber = HEADER_ROW + 1; rowNumber <= validationEndRow; rowNumber++) {
    worksheet.getCell(rowNumber, sideColumnIndex).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [listFormula(SIDE_VALUES)],
      showErrorMessage: true,
      errorTitle: 'ערך לא תקין',
      error: 'בחרו: חתן / כלה / משותף',
    }

    worksheet.getCell(rowNumber, rsvpColumnIndex).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [listFormula(RSVP_VALUES)],
      showErrorMessage: true,
      errorTitle: 'ערך לא תקין',
      error: 'בחרו: ממתין / אישר / אולי / ביטל',
    }
  }
}

function createGuestWorksheet(workbook: ExcelJS.Workbook, guests: Guest[]): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet(GUEST_SHEET_NAME, {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  })

  applyHeaderStyles(worksheet)
  applyColumnStyles(worksheet)

  guests.forEach((guest) => {
    const values = mapGuestToExcelValues(guest)
    worksheet.addRow(GUEST_EXCEL_COLUMNS.map((column) => values[column.key] ?? ''))
  })

  applyDataValidations(worksheet, guests.length)

  const filterEndRow = Math.max(HEADER_ROW, guests.length + HEADER_ROW)
  worksheet.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: filterEndRow, column: GUEST_EXCEL_COLUMNS.length },
  }

  return worksheet
}

function buildHeaderMapping(headers: string[]): Partial<Record<GuestImportField, string>> {
  const mapping: Partial<Record<GuestImportField, string>> = {}

  for (const header of headers) {
    const field = resolveGuestImportField(header)
    if (field && !mapping[field]) {
      mapping[field] = header
    }
  }

  return mapping
}

function normalizePhone(value: unknown): string | null {
  const raw = toText(value)
  if (!raw) return null

  const normalized = raw.replace(/[\s\-\(\)\.]/g, '')
  return normalized || null
}

function normalizeSide(
  value: unknown,
  options?: GuestImportOptions
): { value: GuestSide; error?: string } {
  const side = toText(value)
  if (!side) return { value: 'משותף' }

  if (side.includes('חתן') || side.toLowerCase().includes('groom')) {
    return { value: 'חתן' }
  }

  if (side.includes('כלה') || side.toLowerCase().includes('bride')) {
    return { value: 'כלה' }
  }

  if (
    side.includes('משותף') ||
    side.includes('שניהם') ||
    side.toLowerCase().includes('both')
  ) {
    return { value: 'משותף' }
  }

  const groomAliases = createNameAliases(options?.groomName)
  const brideAliases = createNameAliases(options?.brideName)
  const isGroomSide = matchesAlias(side, groomAliases)
  const isBrideSide = matchesAlias(side, brideAliases)

  if (isGroomSide && isBrideSide) return { value: 'משותף' }
  if (isGroomSide) return { value: 'חתן' }
  if (isBrideSide) return { value: 'כלה' }

  return { value: 'משותף', error: `הערך "${side}" בעמודת צד לא מזוהה` }
}

function normalizeRsvpStatus(
  value: unknown
): { value: RsvpStatus; error?: string } {
  const status = toText(value).toLowerCase()
  if (!status) return { value: 'ממתין' }

  if (
    status.includes('אישר') ||
    status.includes('confirm') ||
    status.includes('yes')
  ) {
    return { value: 'אישר' }
  }

  if (
    status.includes('ביטל') ||
    status.includes('סירב') ||
    status.includes('declin') ||
    status === 'לא'
  ) {
    return { value: 'ביטל' }
  }

  if (
    status.includes('אולי') ||
    status.includes('maybe') ||
    status.includes('uncertain')
  ) {
    return { value: 'אולי' }
  }

  if (status.includes('ממתין') || status.includes('pending')) {
    return { value: 'ממתין' }
  }

  return { value: 'ממתין', error: `הערך "${toText(value)}" בעמודת סטטוס RSVP לא מזוהה` }
}

export function splitGuestFullName(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ')
  return [firstName, lastName]
}

export function joinGuestFullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ').trim()
}

export function normalizeGroupName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed

  const lower = trimmed.toLowerCase().replace(/\s+/g, ' ')

  if (/משפחת?\s*חתן|משפחה\s*של\s*ה?חתן/i.test(lower) || lower === 'groom family') {
    return 'משפחה חתן'
  }

  if (/משפחת?\s*כלה|משפחה\s*של\s*ה?כלה/i.test(lower) || lower === 'bride family') {
    return 'משפחה כלה'
  }

  if (
    /חברים\s*של\s*ה?חתן|חברי\s*חתן/i.test(lower) ||
    lower === 'friends groom' ||
    lower === 'groom friends'
  ) {
    return 'חברים חתן'
  }

  if (
    /חברים\s*של\s*ה?כלה|חברי\s*כלה/i.test(lower) ||
    lower === 'friends bride' ||
    lower === 'bride friends'
  ) {
    return 'חברים כלה'
  }

  return trimmed
}

export function mapGuestToExcelValues(guest: Guest): Record<GuestExcelColumnKey, GuestExcelValue> {
  const [firstName, lastName] = splitGuestFullName(guest.full_name)

  return {
    first_name: firstName,
    last_name: lastName,
    phone: normalizePhone(guest.phone) ?? '',
    side: guest.side,
    group_name: guest.group_name ?? '',
    adults_count: guest.adults_count,
    kids_count: guest.kids_count,
    rsvp_status: guest.rsvp_status,
    gift_amount: guest.gift_amount,
    notes: guest.notes ?? '',
  }
}

export function guestToExcelRecord(guest: Guest): Record<string, string | number> {
  const values = mapGuestToExcelValues(guest)
  return Object.fromEntries(
    GUEST_EXCEL_COLUMNS.map((column) => [column.header, values[column.key] ?? ''])
  )
}

export function resolveGuestImportField(header: string): GuestImportField | null {
  if (!header) return null
  return HEADER_LOOKUP[normalizeHeader(header)] ?? null
}

export function scoreGuestHeaderRow(row: unknown[]): number {
  const found = new Set<GuestImportField>()

  for (const cell of row) {
    const field = resolveGuestImportField(toText(cell))
    if (field) found.add(field)
  }

  let score = found.size
  if (found.has('first_name')) score += 2
  if (found.has('last_name')) score += 2
  if (found.has('full_name')) score += 2
  if (found.has('phone')) score += 1
  if (found.has('adults_count')) score += 1
  return score
}

export function buildGuestWorkbook(guests: Guest[] = []): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook()
  createGuestWorksheet(workbook, guests)
  return workbook
}

export function parseGuestImportRows(
  rows: GuestImportSourceRow[],
  headers: string[],
  weddingId: string,
  options?: GuestImportOptions
): GuestImportParseResult {
  const mapping = buildHeaderMapping(headers)
  const guests: GuestInsert[] = []
  const errors: GuestImportError[] = []

  for (const row of rows) {
    if (Object.values(row.values).every((value) => isBlankValue(value))) {
      continue
    }

    const messages: string[] = []
    const fullName = toText(row.values[mapping.full_name ?? ''])
    const firstName = toText(row.values[mapping.first_name ?? ''])
    const lastName = toText(row.values[mapping.last_name ?? ''])
    const guestName = joinGuestFullName(firstName, lastName) || fullName

    if (!guestName) {
      messages.push('חסר שם פרטי או שם משפחה')
    }

    const adultsValue = mapping.adults_count
      ? row.values[mapping.adults_count]
      : undefined
    const attendingValue = mapping.attending_count
      ? row.values[mapping.attending_count]
      : undefined
    const resolvedAdultsValue = isBlankValue(adultsValue) ? attendingValue : adultsValue

    const sideResult = normalizeSide(row.values[mapping.side ?? ''], options)
    if (sideResult.error) messages.push(sideResult.error)

    const rsvpResult = normalizeRsvpStatus(row.values[mapping.rsvp_status ?? ''])
    if (rsvpResult.error) messages.push(rsvpResult.error)

    const adultsResult = parseNonNegativeInteger(resolvedAdultsValue, 'מבוגרים', 1)
    if (adultsResult.error) messages.push(adultsResult.error)

    const kidsResult = parseNonNegativeInteger(row.values[mapping.kids_count ?? ''], 'ילדים', 0)
    if (kidsResult.error) messages.push(kidsResult.error)

    const giftResult = parseOptionalNonNegativeInteger(row.values[mapping.gift_amount ?? ''], 'מתנה')
    if (giftResult.error) messages.push(giftResult.error)

    if (messages.length > 0) {
      errors.push({
        rowNumber: row.rowNumber,
        messages,
      })
      continue
    }

    const rawGroupName = toOptionalText(row.values[mapping.group_name ?? ''])

    guests.push({
      wedding_id: weddingId,
      full_name: guestName,
      phone: normalizePhone(row.values[mapping.phone ?? '']),
      side: sideResult.value,
      group_name: rawGroupName ? normalizeGroupName(rawGroupName) : null,
      adults_count: adultsResult.value,
      kids_count: kidsResult.value,
      rsvp_status: rsvpResult.value,
      gift_amount: giftResult.value,
      table_id: null,
      notes: toOptionalText(row.values[mapping.notes ?? '']),
    })
  }

  return { guests, errors }
}

export function createGuestTemplateFilename(): string {
  return GUEST_TEMPLATE_FILENAME
}

export function createGuestExportFilename(date = new Date()): string {
  return `רשימת-אורחים-${formatDateSuffix(date)}.xlsx`
}

export function downloadGuestTemplate(): Promise<void> {
  return downloadWorkbook(buildGuestWorkbook(), createGuestTemplateFilename())
}

export function exportGuestsToOfficialExcel(guests: Guest[]): Promise<void> {
  return downloadWorkbook(buildGuestWorkbook(guests), createGuestExportFilename())
}
