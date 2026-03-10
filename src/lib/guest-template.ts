import ExcelJS from 'exceljs'
import { GUEST_GROUP_NAMES } from './constants'

const SIDES = ['חתן', 'כלה', 'משותף']
const RSVP_VALUES = ['ממתין', 'אישר', 'אולי', 'ביטל']
const GROUPS = [...GUEST_GROUP_NAMES]

// Only columns the app actually uses — clean and focused
const TEMPLATE_COLUMNS = [
  { header: "מס'", key: 'num', width: 6 },
  { header: 'שם פרטי', key: 'first_name', width: 16 },
  { header: 'שם משפחה', key: 'last_name', width: 16 },
  { header: 'צד', key: 'side', width: 10 },
  { header: 'קשר', key: 'group', width: 16 },
  { header: 'טלפון', key: 'phone', width: 16 },
  { header: '# מוזמנים', key: 'adults', width: 12 },
  { header: 'ילדים', key: 'kids', width: 10 },
  { header: 'סטטוס RSVP', key: 'rsvp', width: 14 },
  { header: 'שולחן', key: 'table', width: 10 },
  { header: 'מתנה', key: 'gift', width: 10 },
  { header: 'הערות', key: 'notes', width: 22 },
]

const EMPTY_ROWS = 100
const HEADER_ROW = 2 // Row 1 = title, Row 2 = headers, Row 3+ = data
const DATA_START_ROW = HEADER_ROW + 1
const DATA_END_ROW = HEADER_ROW + EMPTY_ROWS

function listFormula(values: string[]): string {
  return '"' + values.join(',') + '"'
}

export async function downloadGuestTemplate(): Promise<void> {
  const wb = new ExcelJS.Workbook()
  wb.views = [{ x: 0, y: 0, width: 10000, height: 20000, firstSheet: 0, activeTab: 0, visibility: 'visible' }]

  const ws = wb.addWorksheet('רשימת אורחים', {
    views: [{ rightToLeft: true }],
  })

  // Row 1: Title
  ws.mergeCells(1, 1, 1, TEMPLATE_COLUMNS.length)
  const titleCell = ws.getCell(1, 1)
  titleCell.value = '💍  רשימת אורחים  💍'
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  titleCell.font = { size: 16, bold: true }
  ws.getRow(1).height = 30

  // Row 2: Headers
  const headerRow = ws.getRow(HEADER_ROW)
  TEMPLATE_COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = col.header
    cell.font = { bold: true, size: 11 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8E0F0' },
    }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF999999' } },
    }
  })
  headerRow.height = 24

  // Column widths
  TEMPLATE_COLUMNS.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width
  })

  // Column indices (1-based)
  const sideCol = 4    // צד
  const groupCol = 5   // קשר
  const rsvpCol = 9    // סטטוס RSVP

  // Data validations + row numbers for empty data rows
  for (let row = DATA_START_ROW; row <= DATA_END_ROW; row++) {
    // Auto row number
    ws.getCell(row, 1).value = row - HEADER_ROW

    // צד dropdown
    ws.getCell(row, sideCol).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [listFormula(SIDES)],
      showErrorMessage: true,
      errorTitle: 'ערך לא תקין',
      error: 'בחרו: חתן / כלה / משותף',
    }

    // קשר dropdown
    ws.getCell(row, groupCol).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [listFormula(GROUPS)],
      showErrorMessage: true,
      errorTitle: 'ערך לא תקין',
      error: 'בחרו קטגוריה מהרשימה',
    }

    // סטטוס RSVP dropdown
    ws.getCell(row, rsvpCol).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [listFormula(RSVP_VALUES)],
      showErrorMessage: true,
      errorTitle: 'ערך לא תקין',
      error: 'בחרו: ממתין / אישר / אולי / ביטל',
    }
  }

  // AutoFilter on header row
  ws.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: DATA_END_ROW, column: TEMPLATE_COLUMNS.length },
  }

  // Generate and download
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'טמפלייט-רשימת-אורחים.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}
