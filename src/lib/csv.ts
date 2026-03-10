import Papa from 'papaparse'
import { read, utils } from 'xlsx'
import type { Guest, GuestInsert } from './types'
import {
  guestToExcelRecord,
  parseGuestImportRows,
  resolveGuestImportField,
  scoreGuestHeaderRow,
  type GuestImportOptions,
  type GuestImportParseResult,
  type GuestImportSourceRow,
} from './guest-excel'

interface HeaderDetectionResult {
  headerRowIndex: number
  score: number
}

interface ExcelSheetCandidate {
  score: number
  rowCount: number
  headers: string[]
  rows: GuestImportSourceRow[]
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\u00a0/g, ' ').trim()
}

function detectHeaderRow(rows: unknown[][]): HeaderDetectionResult {
  let best: HeaderDetectionResult = { headerRowIndex: -1, score: 0 }

  const maxRowsToScan = Math.min(rows.length, 25)
  for (let index = 0; index < maxRowsToScan; index++) {
    const score = scoreGuestHeaderRow(rows[index] ?? [])
    if (score > best.score) {
      best = { headerRowIndex: index, score }
    }
  }

  return best
}

function extractRowsFromSheet(
  rows: unknown[][],
  headerRowIndex: number
): { headers: string[]; dataRows: GuestImportSourceRow[] } {
  const rawHeaderRow = rows[headerRowIndex] ?? []
  const columnDefs = rawHeaderRow
    .map((headerCell, index) => ({
      index,
      header: toText(headerCell),
    }))
    .filter((column) => column.header.length > 0)

  const headers = columnDefs.map((column) => column.header)
  const dataRows: GuestImportSourceRow[] = []

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const sourceRow = rows[rowIndex] ?? []
    const values: Record<string, unknown> = {}
    let hasKnownContent = false

    for (const column of columnDefs) {
      const value = sourceRow[column.index]
      values[column.header] = value

      if (resolveGuestImportField(column.header) && toText(value)) {
        hasKnownContent = true
      }
    }

    if (hasKnownContent) {
      dataRows.push({
        rowNumber: rowIndex + 1,
        values,
      })
    }
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

export function parseCsvFile(
  file: File,
  weddingId: string,
  options?: GuestImportOptions
): Promise<GuestImportParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const headers = results.meta.fields ?? []
        if (scoreGuestHeaderRow(headers) < 2) {
          reject(new Error('NO_IMPORTABLE_HEADERS'))
          return
        }
        const rows = (results.data as Record<string, unknown>[]).map((values, index) => ({
          rowNumber: index + 2,
          values,
        }))
        resolve(parseGuestImportRows(rows, headers, weddingId, options))
      },
      error: (error) => reject(error),
    })
  })
}

async function parseExcelFile(
  file: File,
  weddingId: string,
  options?: GuestImportOptions
): Promise<GuestImportParseResult> {
  const bestSheet = await detectBestExcelSheet(file)
  return parseGuestImportRows(bestSheet.rows, bestSheet.headers, weddingId, options)
}

export async function parseGuestImportFile(
  file: File,
  weddingId: string,
  options?: GuestImportOptions
): Promise<GuestImportParseResult> {
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
  const exportData = guests.map((guest) => guestToExcelRecord(guest))
  const csv = Papa.unparse(exportData, { header: true })
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `רשימת-אורחים-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export type { GuestImportOptions, GuestImportParseResult, GuestImportSourceRow, GuestInsert }
